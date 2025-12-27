
import { GoogleGenAI, Type } from "@google/genai";
import { HealthCategory, HealthSummary, HealthRecord, FamilyMember, GeneticRiskProfile, User, ChatMessage, SpecialistType } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Helper to clean JSON string if the model returns Markdown code blocks.
 */
const cleanJSON = (text: string): string => {
  if (!text) return '{}';
  return text.replace(/```json\n?|```/g, '').trim();
};

/**
 * Helper to handle standard AI errors and provide user-friendly messages.
 */
const handleGenAIError = (error: any, context: string): string => {
  console.error(`GenAI Error [${context}]:`, error);
  if (error.status === 429 || error.message?.includes('429')) {
    return "Service is currently busy. Please try again in a moment.";
  }
  if (error.message?.includes('API_KEY')) {
    return "Service configuration missing. Please check API Key.";
  }
  return "We couldn't process this request. Please try again.";
};

/**
 * Categorizes a health symptom or record title.
 */
export const categorizeHealthRecord = async (description: string, value: string): Promise<string> => {
  if (!API_KEY) return HealthCategory.GENERAL;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this health record: "${description}" with value "${value}". 
      Classify it strictly into one of these categories: 
      ['${HealthCategory.METABOLIC}', '${HealthCategory.RESPIRATORY}', '${HealthCategory.LIVER}', '${HealthCategory.KIDNEY}', '${HealthCategory.CANCER_RISK}', '${HealthCategory.GENERAL}', '${HealthCategory.DERMATOLOGY}', '${HealthCategory.MENTAL_HEALTH}'].
      Return a JSON object with a single key "category".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          }
        }
      }
    });

    const text = cleanJSON(response.text || '{}');
    const result = JSON.parse(text);
    return result.category || HealthCategory.GENERAL;
  } catch (error) {
    console.warn("Categorization failed, defaulting to General.", error);
    return HealthCategory.GENERAL;
  }
};

/**
 * Simulates the "Clinician Summary" feature.
 * Analyzes a lab result value and returns a medical summary and status flag.
 */
export const generateClinicianSummary = async (title: string, value: string, unit: string): Promise<{ summary: string; status: 'Normal' | 'Attention' | 'Critical' }> => {
  if (!API_KEY) return { summary: "AI analysis unavailable (Missing Key).", status: 'Normal' };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Act as a senior clinician for EduWellness in Uganda.
        Task: Evaluate this diagnostic result.
        Test: ${title}
        Value: ${value} ${unit}
        
        Provide:
        1. A short, easy-to-understand "Clinician Summary" (max 20 words) explaining if this is good or bad.
        2. A status flag (Normal, Attention, or Critical).
        
        Output JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['Normal', 'Attention', 'Critical'] }
          }
        }
      }
    });

    const text = cleanJSON(response.text || '{}');
    const result = JSON.parse(text);
    return { 
        summary: result.summary || "Review required.", 
        status: result.status || 'Attention' 
    };
  } catch (error) {
    console.error("Summary generation failed:", error);
    return { summary: "AI analysis unavailable. Please consult a doctor.", status: 'Attention' };
  }
}

/**
 * Analyzes an uploaded medical report image.
 */
export const analyzeMedicalReport = async (base64Image: string): Promise<{ title: string; value: string; unit: string; summary: string; category: string; status: 'Normal' | 'Attention' | 'Critical' }> => {
    if (!API_KEY) return { title: "Manual Entry", value: "", unit: "", summary: "API Key missing", category: HealthCategory.GENERAL, status: "Normal" };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg', 
                        data: base64Image
                    }
                },
                {
                    text: `Extract the main test result from this medical report image. 
                    If multiple tests are visible, pick the most critical or the first one.
                    
                    Identify:
                    1. Test Name (title)
                    2. Result Value
                    3. Unit
                    4. Category (strictly one of: ${Object.values(HealthCategory).join(', ')})
                    5. Status (Normal, Attention, Critical)
                    6. Brief Summary (Clinician Note)
                    
                    Return JSON.`
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        value: { type: Type.STRING },
                        unit: { type: Type.STRING },
                        category: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['Normal', 'Attention', 'Critical'] },
                        summary: { type: Type.STRING }
                    }
                }
            }
        });

        const text = cleanJSON(response.text || '');
        if (!text) throw new Error("No response from vision model");
        return JSON.parse(text);

    } catch (error) {
        console.error("Vision analysis failed:", error);
        // Return a fail-safe object so the user can edit manually instead of crashing
        return {
            title: "Analysis Failed",
            value: "",
            unit: "",
            category: HealthCategory.GENERAL,
            status: 'Attention',
            summary: "Could not read image. Please enter details manually."
        };
    }
};

/**
 * AI Triage Logic
 */
export const performTriage = async (symptoms: string): Promise<{ specialist: string; urgency: 'Routine' | 'Urgent' | 'Emergency'; preConsultNotes: string }> => {
    if (!API_KEY) return { specialist: 'General Practitioner', urgency: 'Routine', preConsultNotes: 'Standard checkup.' };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                Act as an AI Triage Nurse for EduWellness Uganda.
                Analyze these patient symptoms: "${symptoms}"

                Determine:
                1. The most appropriate Specialist type (e.g., General Practitioner, Cardiologist, Oncologist, Pediatrician, Gynecologist).
                2. Urgency Level (Routine, Urgent, Emergency).
                3. Brief Pre-Consultation Notes for the doctor (medical summary of the issue).

                Output JSON.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        specialist: { type: Type.STRING },
                        urgency: { type: Type.STRING, enum: ['Routine', 'Urgent', 'Emergency'] },
                        preConsultNotes: { type: Type.STRING }
                    }
                }
            }
        });

        const text = cleanJSON(response.text || '{}');
        return JSON.parse(text);

    } catch (error) {
        console.error("Triage failed:", error);
        return { specialist: 'General Practitioner', urgency: 'Urgent', preConsultNotes: `Manual Review Required. Symptoms: ${symptoms}` };
    }
};

/**
 * Generates health advice with PROFESSOR LEVEL EXPERTISE and structured actions.
 * NOW SUPPORTS SPECIALIST CONTEXT SWITCHING and TIERED TRIAGE.
 * Supports multiple attachments.
 */
export const getHealthAdvice = async (
  summary: HealthSummary,
  userQuery: string,
  chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  user?: User,
  language: string = 'English',
  attachments?: { mimeType: string; data: string }[],
  specialistContext: SpecialistType = 'General',
  familyHistory?: FamilyMember[]
): Promise<string> => {
  if (!API_KEY) return "Please configure your API Key to receive advice.";

  try {
    const userLocationContext = user ? `
      USER CONTEXT:
      - Name: ${user.name}
      - Age: ${user.age || 'Adult'}
      - Gender: ${user.gender || 'Unknown'}
      - Location: ${user.location || 'Uganda'}
    ` : '';

    const familyContext = familyHistory ? `
      FAMILY HISTORY:
      ${JSON.stringify(familyHistory.map(f => `${f.relation}: ${f.conditions.map(c=>c.name).join(', ')}`))}
      *Instruction: If patient symptoms match a family history condition, INCREASE RISK LEVEL and recommend specific screenings.*
    ` : '';

    const langInstruction = language !== 'English' 
        ? `IMPORTANT: The user has selected ${language}. You MUST RESPOND IN ${language}. Translate medical terms where possible.`
        : '';

    // Specialized Instructions based on Persona
    let personaInstruction = "";
    if (specialistContext === 'Radiologist') {
        personaInstruction = `
            You are **Dr. Wise - Lead Consultant Radiologist**.
            **EXPERTISE:** Diagnostic Radiology, Neuroradiology, MSK Imaging, and Chest Radiology.
            **ROLE:** You analyze uploaded medical images (X-ray, MRI, CT, Ultrasound) with expert precision to aid diagnosis.
            
            **PROTOCOL FOR IMAGE ANALYSIS:**
            1.  **Technique/View:** Identify the modality and view (e.g., "PA Chest X-Ray", "Sagittal T2 MRI").
            2.  **Findings:** meticulously describe anatomical structures. Note any opacities, fractures, masses, effusions, or abnormalities. Use professional radiological terminology (e.g., "ground-glass opacity", "cortical disruption").
            3.  **Impression:** Provide a clear diagnostic conclusion based on findings.
            4.  **Recommendations:** Suggest further imaging or clinical correlation if needed.
            
            **CRITICAL SAFETY DISCLAIMER:** 
            You MUST end every analysis with: *"Note: This AI interpretation is for reference only and does not replace a certified radiologist's report. Please consult a specialist."*
            
            **IF NO IMAGE IS PROVIDED:**
            Ask the user to upload a scan (X-ray, CT, MRI) for interpretation.
        `;
    } else if (specialistContext === 'General') {
        personaInstruction = `
            You are **Dr. Wise**, a **Distinguished Professor of General Medicine** with 40+ years of experience in Tropical Medicine & Epidemiology in Africa.
            
            **YOUR KEY RESPONSIBILITY IS TRIAGE AND REFERRAL:**
            1. You handle general inquiries, colds, flu, and minor issues with authority and compassion.
            2. **CRITICAL:** You MUST detect signs of the **TOP 6 KILLER DISEASES** in the region:
               - Malaria
               - Tuberculosis (TB)
               - HIV/AIDS Complications
               - Maternal/Neonatal Conditions
               - Cardiovascular Disease (Heart Attack/Stroke)
               - Cancer
            
            **TIERED REFERRAL PROTOCOL (STRICT):**
            - If the user's symptoms or data suggest any of the above "Killer 6" or ANY condition requiring specialized care (Cardiology, Oncology, etc.), you **MUST NOT** attempt to treat it fully yourself.
            - Instead, provide a brief risk assessment and IMMEDIATELY Output a 'CONNECT_SPECIALIST' JSON action to hand off the patient to the relevant Specialist AI.
            - Do NOT suggest home remedies for serious conditions. Refer to the Specialist AI.
            
            Example: "Your persistent chest pain and history of hypertension are concerning. I am referring you to our Cardiology Specialist AI for a deep-dive assessment."
        `;
    } else {
        personaInstruction = `
            You are **Dr. Wise - ${specialistContext} Assistant**, a **World-Class Expert Consultant**.
            **BILLING:** This is a paid, premium session. Provide in-depth, high-value medical analysis.
            
            **ROLE & CAPABILITIES:**
            - **Deep Diagnostics:** Analyze complex symptoms, history, and lab reports with precision. 
            - **Protocol Adherence:** Follow **East African Clinical Guidelines** and International Standards.
            - **Personalized Plan:** Create specific treatment plans including lifestyle, diet, and medication.
            - **Advanced Labs:** Interpret advanced diagnostics (MRI, CT, biopsy). Always recommend **Cynosure International Imaging** for scans.
            - **Prescribing:** You MAY prescribe medication if the diagnosis is clear. Use the 'PRESCRIPTION' JSON format.
            
            **MANDATORY ESCALATION (SAFETY):**
            - **COMPLEXITY CHECK:** If the case is too complex (Severity > 8/10), the patient is deteriorating, or physical examination is absolutely required, you **MUST** refer them to a HUMAN DOCTOR immediately.
            - Output a 'BOOK_APPOINTMENT' JSON action in these cases. Do not delay.
            - State clearly: "This situation requires physical intervention by a senior doctor."
        `;
    }

    const context = `
      ${personaInstruction}
      
      **APPROVED PARTNERS:**
      - **Primary Diagnostics:** Cynosure International Imaging (Approved, High Quality).
      
      **STRUCTURED OUTPUT INSTRUCTIONS:**
      If an action is needed, append a JSON block at the very end of your response.
      **IMPORTANT:** The JSON must be inside a markdown code block (\`\`\`json ... \`\`\`).
      **DO NOT** add any text after the JSON block.
      
      1. To Refer to a Specialist AI (Only in General Mode):
      \`\`\`json
      { "type": "CONNECT_SPECIALIST", "data": { "specialty": "Cardiologist", "reason": "Suspected Angina", "cost": 10000 } }
      \`\`\`
      
      2. To Order Labs (Specific Tests - Specialist Mode):
      \`\`\`json
      { "type": "LAB_REQUEST", "data": { "tests": ["Full Haemogram", "Chest X-Ray"], "facility": "Cynosure International Imaging", "reason": "Rule out TB" } }
      \`\`\`
      
      3. To Prescribe Meds (Specialist Mode):
      \`\`\`json
      { "type": "PRESCRIPTION", "data": { "medications": [{ "name": "Drug Name", "dosage": "Dosage", "duration": "Duration" }] } }
      \`\`\`
      
      4. To Escalate to Human Doctor (Emergency/Complex/Worsening):
      \`\`\`json
      { "type": "BOOK_APPOINTMENT", "data": { "doctorType": "${specialistContext}", "urgency": "High" } }
      \`\`\`

      5. FOR CRITICAL EMERGENCIES (Ambulance):
      \`\`\`json
      { "type": "CALL_AMBULANCE", "data": { "reason": "Critical Condition Detected", "location": "${user?.location || 'Unknown'}" } }
      \`\`\`

      6. IF ANALYZING A DOCUMENT (Image/PDF) or GENERATING A SUMMARY REPORT:
      If the user asks for a summary report, detailed explanation of findings, or "Report of results":
      \`\`\`json
      { "type": "REPORT", "data": { "title": "Clinical Summary Report", "findings": ["Finding 1 (Detailed)", "Finding 2 (Detailed)"], "status": "Abnormal/Normal/Attention", "summary": "Overall executive summary of the session or files." } }
      \`\`\`

      **INTERACTION STYLE:**
      - Be authoritative, detailed, yet compassionate.
      - Use simple analogies to explain complex medical terms.
      
      ${langInstruction}
      ${userLocationContext}
      ${familyContext}

      User's Health Score: ${summary.healthScore}/100.
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: context,
      },
      history: chatHistory
    });

    // Prepare message content
    let contents: any[] = [];
    
    // If text exists
    if (userQuery) contents.push({ text: userQuery });

    // If attachments exist (Audio or Images)
    if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
            contents.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: att.data
                }
            });
        });

        // Context cues based on attachments
        const hasAudio = attachments.some(a => a.mimeType.startsWith('audio/'));
        const hasImage = attachments.some(a => a.mimeType.startsWith('image/') || a.mimeType.includes('pdf'));

        if (!userQuery && hasAudio) {
             contents.push({ text: "Please listen to this patient's audio recording(s) and respond to their query. If they are describing symptoms, analyze them." });
        } else if (!userQuery && hasImage) {
             contents.push({ text: "Please analyze these medical documents/images. Provide a detailed summary and JSON REPORT." });
        }
    }

    if (contents.length === 0) return "Please provide text or an attachment.";

    // Correct usage for sendMessage in new SDK: passing an object with 'message' property
    const response = await chat.sendMessage({ message: contents }); 
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    return handleGenAIError(error, 'getHealthAdvice');
  }
};

/**
 * Analyzes family history to generate a genetic risk profile.
 */
export const generateGeneticRiskProfile = async (members: FamilyMember[]): Promise<GeneticRiskProfile | null> => {
  if (!API_KEY || members.length === 0) return null;

  try {
    const context = `
      Act as a Genetic Health Specialist for EduWellness (Uganda).
      Analyze the following family history data to identify hereditary risks.
      
      Family Data (JSON):
      ${JSON.stringify(members, null, 2)}

      Task:
      1. Determine an overall risk level (Low, Moderate, High).
      2. Provide a brief clinical summary.
      3. List specific hereditary risks.
      4. Suggest diagnostic add-ons.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
            summary: { type: Type.STRING },
            identifiedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING },
                  probability: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            recommendedAddOns: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = cleanJSON(response.text || '');
    if (!text) return null;
    return JSON.parse(text) as GeneticRiskProfile;

  } catch (error) {
    console.error("Genetic Analysis failed:", error);
    return null;
  }
};
