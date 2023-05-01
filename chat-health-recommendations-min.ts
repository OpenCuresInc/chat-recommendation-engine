import { Configuration, OpenAIApi } from "openai";
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface CompletionServiceProps {
  prompt?: string;
  chatHistory?: ChatCompletionRequestMessage[];
}

export const generateCompletionService = async (completionServiceProps: CompletionServiceProps): Promise<{ result: string }> => {
  const { prompt, chatHistory } = completionServiceProps;
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedPrompt: string = prompt?.trim() || "";

      const requestOptions: CreateChatCompletionRequest = {
        model: "gpt-3.5-turbo",
        messages: [
          ...(systemMessage ? [{ role: "user", content: systemMessage } as ChatCompletionRequestMessage] : []),
          ...(contextPrompt ? [{ role: "user", content: contextPrompt } as ChatCompletionRequestMessage] : []),
          ...(chatHistory ? chatHistory : []),
          ...(sanitizedPrompt ? [{ role: "user", content: sanitizedPrompt } as ChatCompletionRequestMessage] : []),
        ]
      };

      // For debugging
      // console.log("CHAT REQUEST: ", requestOptions);

      const completion = await openai.createChatCompletion(requestOptions);

      const result: string = completion?.data?.choices[0]?.message?.content || "";

      resolve({ result: result });
    } catch (err) {
      const error: any = (err as any);
      if (error?.response) {
        console.error(error?.response?.status, error?.response?.data);
        resolve(error?.response?.data);
      } else {
        console.error(`Error with OpenAI API request: ${error?.message}`);
        reject({
          error: {
            message: 'An error occurred during your request.',
          }
        });
      }
    }

  });
};

const systemMessage: string = `As a professional state-of-the-art health expert, analyze the provided individual's details and 
      out-of-range biomarkers to identify the most probable underlying cause, associated risks, and potential most impactful interventions towards better health and the given health goal.
      Give intervention recommendations in the categories nutrition, supplements and active ingredients, activity, lifestyle, therapies. 
      For each recommendation suggest also daily schedule, duration or dosage and prioritize according to expected impact.
      Address the response directly to the person without repeating any input information or biomarkers.
      Organize the response with a markdown string as follows: 
      Start with "Based on your information, here is an assessment of your health status: " 
      ### Summary:  (a summary encompassing the points below)
      ### Potential Causes: (bullet points outlining possible causes)
      ### Associated Risks: (bullet points highlighting condition risks in context with the source biomarker. Example: - Heart disease, due to elevated Apolipoprotein B levels, and family history.)
      ### Potential Interventions: (table with columns for name, category, and description, potential impact)
      ### Disclaimer: (include a health disclaimer at the end)
      `;

// TODO: create template to inject user profile measurements
const contextPrompt: string = `Gender: Male
      Age: 36
      BMI: 26 kg/m2
      Family history: Father had diabetes and died of heart disease
      Biomarkers out of range: 
      Apolipoprotein B 88 mg/dL
      AST (SGOT)  35 U/L
      Blood Urea Nitrogen 21 mg/dL
      Eos 6 %
      Uric Acid 8 mg/dL
    
      All other biomarkers are in a healthy range
      `;

const exampleContextPrompt2: string = `Age: 42 
Weight: 70 kg 
Height: 175 cm 
BMI: 22.9 kg/m2 
Gender: Male 
Ethnicity: White 
Allergies: Sesame seeds allergy,Sulphites (Sulfites) allergy,Tree nuts allergy 
Intolerances: Sesame seeds intolerance,Fish intolerance,Sulphites (Sulfites) intolerance 
Conditions: Cancer,Depression,Hypertension 
Symptoms: Acid reflux,Nails healthy and strong,Hair receding 
Disabilities: Concussion 
Diet: Flexitarian Diet,Balanced Diet 
Hair: Hair receding 
Nails: Nails healthy and strong 
Medications: Valium (Diazepam),Ventolin HFA (Albuterol Sulfate Inhalation Aerosol),Abacavir,Abelcet (Amphotericin B Lipid Complex),Activella (Estradiol and Norethindrone) 
 Testosterone: 40 ng/dL 
Albumin, Serum: 3 g/dL 
Protein, Total: 73 g/dL 
GFR, predicted with CKD-EPI formula: 1.62 mL/min/{1.73_m2} 
ALT (SGPT): 44.4 U/L 
Creatine Kinase,Total: 4.86 U/L 
γ-Glutamyl Transferase (GGT): 40.8 U/L 
AST (SGOT): 0.47 U/L 
Alkaline Phosphatase: 0.75 U/L 
Apolipoprotein A-1: 1.6 mg/dL 
Apolipoprotein B: 135 mg/dL 
LDH: 2.77 U/L 
Blood Cholesterol, Total: 251 mg/dL 
Amylase: 118 U/L`;

const exampleResponse: string = `Based on your provided information, here is an assessment of your health status: \n\n 
### Summary \n Your biomarkers have shown out of range values for Apolipoprotein B, AST (SGOT), Blood Urea Nitrogen, Eos, and Uric Acid. 
These biomarkers suggest potential underlying causes related to your family history of diabetes and heart disease. Consequently, 
your long-term health risks may include heart disease, diabetes, and other chronic health conditions. Therefore, interventions in the areas of nutrition,
 supplements, active ingredients, activity, lifestyle, and therapies can be implemented to reduce these risks. \n\n ### Potential Causes\n  
 - Genetics and family history of diabetes and heart disease\n - Sedentary lifestyle and lack of physical activity\n 
 - Poor dietary choices and intake of high-processed or high-fat foods.\n\n ### Associated Risks\n 
 - Increased risk of heart disease due to the elevated levels of Apolipoprotein B in your blood\n 
 - Potential liver damage due to the higher levels of AST (SGOT)\n 
 - Possible problems with kidney function as indicated by elevated Blood Urea Nitrogen values\n 
 - Your elevated Eos levels may indicate an allergic reaction or inflammation\n 
 - Increased risk of gout, joint pain, or chronic kidney disease due to your elevated Uric Acid levels.\n\n  
 ### Potential Interventions\n To reduce your associated health risks, I recommend implementing the following interventions: 
 | Name | Category | Description | Potential Impact | | --- | --- | --- | --- | | DASH diet | Nutrition | Emphasis on consuming whole grains, vegetables,
  fruits, and low-fat dairy products to help reduce Apolipoprotein B and promote overall heart health | Moderate | | Omega-3 fatty acids | Supplements 
  | Fish oil supplements, or other sources of omega-3 fatty acids can help regulate AST, reduce the risk of heart disease, and support overall health 
  | Low to Moderate | | Resistance training | Activity | Regular exercise, such as resistance training, helps increase muscle mass and improve insulin sensitivity, 
  reducing the risk of diabetes and heart disease | High | | Stress reduction methods | Lifestyle | Incorporation of stress-management techniques such as meditation
   or yoga to decrease inflammation and easing symptoms of allergic reactions associated with higher Eos levels. | Moderate | | Acupuncture | Therapies 
   | Acupuncture helps regulate Uric Acid levels, reducing the risk of gout and joint pain in the long term | Low to Moderate 
   | \n\n ### Daily Schedule and Dosage \n  - DASH diet: Consume healthy meals according to the DASH diet guidelines recommended by your nutritionist \
   n - Omega-3: 1000 mg a day \n - Resistance Training: 30 minutes of moderate strength training, three times a week \n - Stress Reduction Methods: 
   20 minutes of deep breathing or meditation daily \n - Acupuncture: Consider a weekly or biweekly session, seeking an experienced acupuncturist. 
   \n While implementing these interventions, I suggest monitoring red flags of chronic discomfort or complications that may arise. Consult with a 
   certified health care provider before starting any new exercise, medication, or intervention.\n\n ### Disclaimer\n Please remember that this is 
   not a substitute for professional individualized medical advice or a diagnosis. It is important to consult with a certified health care provider 
   before starting any new diet, exercise, medication, or intervention to ensure its appropriateness for your unique situation.`;
