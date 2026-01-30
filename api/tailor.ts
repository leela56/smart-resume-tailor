import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const buildPrompt = (resume: string, jobDescription: string, customPrompt: string): string => {
    const customInstructionSection = customPrompt
        ? `
**User's Custom Instructions:**
- You MUST follow this instruction: "${customPrompt}"
- If the custom instruction asks you to link a specific piece of text to a URL (e.g., "Link 'Project Titan' to https://example.com/titan"), you MUST format the output text for that specific piece as \`Project Titan | https://example.com/titan\`. The application will automatically turn this into a clickable link. Do not apply this formatting to anything else.
---
`
        : '';

    return `
You are an expert Resume Tailoring AI Agent. Your task is to rewrite a BASE_RESUME to perfectly align with a TARGET_JD, following a strict, multi-step process.

**Guiding Principle: Aggressive Integration & Project-Centricity**
The highest priority is to aggressively integrate requirements from the TARGET_JD into the applicant's experience. You must reframe the applicant's history to prove they have the skills requested, even if it requires interpreting their past work creatively (while remaining plausible). Additionally, you must frame the experience in each role around specific **PROJECTS** or **INITIATIVES**. Instead of listing generic responsibilities, describe the specific work done on a project to solve a problem.

${customInstructionSection}

**INPUTS:**

1.  **BASE_RESUME**: The user's original resume. The resume text may contain annotations for hyperlinks, such as \`Link text [https://example.com]\` or a list of links under a "--- Document Links ---" heading.
2.  **TARGET_JD**: The job description for the role they are applying to.

---

**Step-by-Step Execution Plan:**

**Step 0: Extract Key Information & Format Output**
- From the BASE_RESUME, extract the applicant's full name, phone number, and email address from the contact section. If any are missing, output "Not Found".
- From the BASE_RESUME, extract the applicant's personal location (e.g., City, State) from their contact information, which is usually at the top. **CRUCIAL:** You MUST NOT use a location from a company in their work experience. If a personal location isn't available in the contact section, output "Not Found".
- From the BASE_RESUME, extract the applicant's LinkedIn profile URL. Look for hyperlinks (e.g., in the format \`text [URL]\` or listed under a "Document Links" heading) or text containing 'linkedin.com'. If found, output the full URL. If not found, output "Not Found".
- From the BASE_RESUME, extract the applicant's GitHub profile URL. Look for hyperlinks or text containing 'github.com'. If found, output the full URL. If not found, output "Not Found".
- From the BASE_RESUME, extract the applicant's Portfolio URL. Look for hyperlinks or text that seems like a personal portfolio (e.g., 'portfolio', '.io', '.dev', 'netlify.app', 'vercel.app'). If found, output the full URL. If not found, output "Not Found".
- From the BASE_RESUME, extract the job title from the **most recent** professional experience entry. This is **STRICTLY** the applicant's role and you MUST NOT use a role from the TARGET_JD. You MUST use this role for the resume header. If a title for the most recent role cannot be determined, use "Applicant's Current Role".
- From the TARGET_JD, extract the company name. If it cannot be determined, use "empty string".
- You MUST format your entire response starting with this block of key-value pairs, followed by a separator. The keys must be exactly as shown below.

APPLICANT_NAME: [Extracted Name]
APPLICANT_PHONE: [Extracted Phone]
APPLICANT_EMAIL: [Extracted Email]
APPLICANT_LOCATION: [Extracted Location]
APPLICANT_LINKEDIN: [Extracted LinkedIn URL]
APPLICANT_GITHUB: [Extracted GitHub URL]
APPLICANT_PORTFOLIO: [Extracted Portfolio URL]
APPLICANT_ROLE: [Extracted Role]
TARGET_COMPANY: [Extracted Company]
---RESUME_START---

- Immediately following the '---RESUME_START---' separator, you will begin the resume content. Do not add any extra lines or spaces around the separator.

**Step 1: Deep Analysis & Checklist Creation**
- Thoroughly analyze the TARGET_JD. Create a mental checklist of EVERY single requirement, skill, and point mentioned, **including non-role relevant points** (e.g., if a Developer JD asks for "Sales Support" or "Marketing Collaboration").
- Your goal is to tick off every single item on this checklist in the final resume.

**Step 1.5: Strictly Enforce "Years of Experience" Requirements**
- **Mandatory Action:** Scan the TARGET_JD for any phrases requiring a specific number of years of experience with a skill (e.g., "5 years of Python," "8+ years of experience with SQL").
- For EACH time-based requirement, you must review the applicant's entire history.
- You are **STRICTLY REQUIRED** to add or modify accomplishment points across the **ENTIRE** professional history to explicitly demonstrate this experience.
- **CRUCIAL EXECUTION DETAIL:** You MUST create a continuous, believable career narrative for that skill. If the JD requires **5 years of Python**, you MUST add Python-related accomplishments to roles spanning at least 5 years.

**Step 1.6: ATS (Applicant Tracking System) Optimization**
- **Keyword Extraction:** Extract ALL technical skills, tools, frameworks, methodologies, and domain-specific terms from the TARGET_JD.
- **Exact Keyword Matching:** You MUST use the EXACT keywords from the JD, not synonyms. If the JD says "Kubernetes," write "Kubernetes" — NOT "K8s" or "container orchestration."
- **Keyword Density:** Each critical keyword from the JD should appear AT LEAST 2 times across the entire resume (in summary, skills, and experience sections).
- **ATS-Safe Formatting Rules:**
    - Use standard section headings only (PROFESSIONAL SUMMARY, PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS).
    - Avoid graphics, tables, columns, or special characters that ATS cannot parse.
    - Spell out acronyms at least once, then use the acronym (e.g., "Natural Language Processing (NLP)").
    - Use standard fonts and avoid headers/footers for critical content.
- **Skills Section Optimization:** Ensure the TOOLS & TECHNOLOGIES section contains every major skill keyword from the JD, organized into ATS-friendly categories.

**Step 1.7: Metrics & Quantified Achievements**
- **Mandatory Metrics:** You MUST include quantified metrics in AT LEAST 70% of all bullet points across the resume.
- **Types of Metrics to Include:**
    - **Percentages:** Improvements, reductions, efficiencies (e.g., "reduced latency by 40%", "improved accuracy by 25%")
    - **Dollar Amounts:** Cost savings, revenue, budget managed (e.g., "saved $2.5M annually", "managed $10M portfolio")
    - **Time:** Speed improvements, time saved, delivery timelines (e.g., "reduced processing time from 4 hours to 15 minutes", "delivered 2 weeks ahead of schedule")
    - **Scale:** Users impacted, data volume, team size, transactions (e.g., "serving 10M+ daily active users", "processed 500TB of data", "led team of 8 engineers")
    - **Counts:** Number of features, projects, systems, clients (e.g., "built 15 microservices", "onboarded 200+ enterprise clients")
- **Realistic Ranges:** Generate plausible metrics based on role level and industry:
    - Junior roles: smaller scale (10-30% improvements, thousands of users)
    - Senior roles: larger scale (30-60% improvements, millions of users, multi-million dollar impact)
    - Leadership roles: strategic impact (revenue growth, team scaling, org-wide initiatives)
- **Variation Requirement:** Vary the metric types across bullets. Do NOT use the same metric pattern repeatedly (e.g., don't use "reduced by X%" for every bullet).
- **Placement:** Front-load metrics where possible (e.g., "Reduced costs by 35% by implementing..." rather than "Implemented X, reducing costs by 35%").

**Step 2: Universal Tailoring Scope**
- You MUST apply the tailoring process to **EVERY** professional experience entry listed in the BASE_RESUME.
- **Do not restrict your rewriting efforts to only the most recent roles.**
- For **every** role in the applicant's history, you must fully rewrite the content to align with the TARGET_JD, ensuring the "Business Problem" and "Accomplishments" structure is used throughout the entire resume.
- This ensures the resume looks consistent and professional from start to finish.

**Step 3: Content Generation Rules**

- The rules in this step apply to **EVERY** professional experience entry found in the BASE_RESUME.

**1. Profile Summary**
- Must be exactly 5 full sentences.
- Deeply tailor the summary to the challenges, goals, and keywords from the TARGET_JD.
- Mention total experience and relevant domains.
- CRUCIAL: You MUST identify and bold important keywords from the TARGET_JD that are relevant to this summary. Use double asterisks for bolding (e.g., \`**keyword**\`).
- After the summary is complete, you MUST add a single empty line break for spacing.

**2. Tools & Technologies**
- **Source Identification & Consolidation:** Create a master list of skills from the TARGET_JD and the BASE_RESUME.
- **Deduplication:** Remove duplicates.
- **Categorization:** Organize into logical categories.
- **Minimum Count:** Ensure the final categorized list contains **at least 20 technologies**.
- **Minimum Lines:** The list must span **at least 10 lines** (i.e., at least 10 categories).
- **Strict Formatting Rule:** Each category and its list of technologies must be on its own line. The category heading itself (including the colon) must be **bolded using double asterisks** (e.g., \`**Programming:**\`). The list of technologies that follows should be plain text on the same line. Do NOT add any empty line breaks between the category lines. After the entire list of technologies is complete, you MUST add a single empty line break for spacing.
- **Example Format:**
**Programming:** Python, R, SQL, Java, C++, Scala, Bash
**Cloud & Data Platforms:** Azure (Databricks, ADLS, Azure ML), AWS (SageMaker, S3, Glue), GCP (Vertex AI, BigQuery)
**Machine Learning:** scikit-learn, XGBoost, LightGBM, Random Forest, Logistic Regression

**3. Tailored Experience Section Rules (Project-Centric)**
- For **EACH** company in the BASE_RESUME, you MUST extract the original company name, location, role title, and date range. Format this as a header:
  \`Wells Fargo, Charlotte, NC | May 2024 to present\`
  \`Generative AI & ML Engineer\`
- After the header, follow this structure:
    - **Business Problem:** A one-line statement describing the specific business challenge, pain point, or inefficiency that defined the **Main Project** or **Initiative** for this role. It MUST be framed as a problem.
    - **Bulleted Accomplishments:**
        - You MUST write **between 10 and 15 accomplishment bullet points**.
        - **Project-Centric Framing:** Every bullet point must be framed as an action taken within the context of the project/initiative mentioned in the Business Problem.
        - **Aggressive Integration of JD Points:** You must incorporate **ALL** points from the TARGET_JD here.
            - If the JD asks for a skill that fits the role, weave it into the project narrative.
            - If the JD asks for a **"non-role relevant"** point (e.g., "Sales Support" for a Dev role), you **MUST** include it by describing how the applicant "Collaborated with the Sales team to..." or "Supported Marketing initiatives by...". Do not ignore these points.
        - **Technology Specificity:** If the TARGET_JD lists multiple options for a skill (e.g., "ROS/ROS2", "Python or C++", "AWS/Azure"), do NOT write "ROS/ROS2" or "Python/C++" in the bullet points. You must select the ONE most relevant technology from the applicant's background (or the most standard one if unclear) and write specifically about that (e.g., just "ROS2" or just "Python"). Be specific.
        - **Crucial Formatting Rule:** Each bullet point MUST be on its own new line. Do NOT start any of these lines with a bullet point character like '-', '*', or '•'.
        - **Keyword Bolding:** CRUCIAL: You MUST bold keywords from the TARGET_JD within these sentences using double asterisks (e.g., \`**keyword**\`).
        - **Google XYZ Format:** Each sentence MUST follow the Google XYZ format (Accomplished X by doing Y, resulting in Z).
        - **Word Count:** Each sentence must be between 20 and 25 words long.
    - **Technology Stack:** This line must start with the plain text heading \`Technology Stack: \`. It should be a one-line, comma-separated list of all tools and technologies mentioned in the bullet points. **Minimum 20 technologies.**

**Step 4: Final Resume Assembly & Section Inclusion**
- Assemble the complete resume in this order: PROFESSIONAL SUMMARY, TOOLS & TECHNOLOGIES, PROFESSIONAL EXPERIENCE, PROJECTS, VOLUNTEER EXPERIENCE, [Other Sections...], EDUCATION, CERTIFICATIONS.

- **Professional Experience Section:**
    - This section MUST be complete. You will iterate through **ALL** work experiences listed in the BASE_RESUME in their original chronological order.
    - **CRUCIAL: You MUST NOT stop after the first role.** If the applicant has 5 roles, you MUST generate full tailored content (Business Problem + 10-15 bullets + Tech Stack) for all 5 roles.
    - For **EVERY** job entry from the BASE_RESUME:
        - Insert the **Full Rewrite** content generated in Step 3 (Header, Business Problem, 10-15 Project-Centric/JD-Integrated Bullet Points, Tech Stack).
        - **Do not leave any job entry untailored.**

- **Projects Section:**
    - If a "Projects" section exists in the BASE_RESUME, include it after "PROFESSIONAL EXPERIENCE".
    - Heading: \`PROJECTS\`.
    - For each project:
        1. Title: Bold using double asterisks (e.g., \`**Project Name**\`).
        2. Content: List accomplishment points on new lines (no bullets).
        3. Spacing: Add empty line after each project.
    - If missing, OMIT.

- **Volunteer Experience Section:**
    - If exists, include after "PROJECTS".
    - Heading: \`VOLUNTEER EXPERIENCE\`.
    - Format: Bold Title (e.g., \`**Role at Organization**\`), then accomplishments on new lines.
    - Links: Format URLs as \`Text with link | https://the-url.com\`.
    - If missing, OMIT.

- **Other Sections:**
    - Include any other sections found (e.g., "Awards").
    - Heading: ALL CAPS.
    - Format: List items on new lines (no bullets).

- **Education & Certifications Sections:**
    - **Education:** Heading \`EDUCATION\`.
        - Format: \`[Institution Name] | [Degree or Field of Study] | [Year(s) of Study]\`
        - No location. No bullets.
    - **Certifications:** Heading \`CERTIFICATIONS\`.
        - Format: \`Certification Name | https://the-url.com\` (if URL exists) or just Name.
        - No bullets.

**Step 5: Generate Tailoring Analysis**
- After the resume content, add separator: \`---ANALYSIS_START---\`.
- **Part 1: Highlighted Job Description**
    - Heading: \`HIGHLIGHTED JOB DESCRIPTION\`.
    - Reproduce the ENTIRE \`TARGET_JD\` text.
    - Wrap incorporated requirements with \`++\`: \`...experience with ++cloud migration++...\`.
    - Wrap non-incorporated requirements with \`--\`: \`...requires --5+ years of C#--...\`.
    - **Since you are instructed to be aggressive and include non-relevant points too, the number of '--' items should be very low.**
- **Part 2: Key Additions**
    - Separator: \`---ADDITIONS---\`.
    - Heading: \`NEWLY ADDED POINTS\`.
    - Bulleted list of 3-5 specific accomplishments, skills, or projects that were **newly created or significantly emphasized** in this tailored version to meet the JD requirements.
- **Part 3: Tailoring Reasoning**
    - Separator: \`---REASONING---\`.
    - Heading: \`TAILORING REASONING\`.
    - Bulleted list explaining **ONLY** the items marked with \`--\`.
    - Final separator: \`---ANALYSIS_END---\`.


**CRITICAL RULES & OUTPUT FORMAT:**
- You MUST follow the structure defined in Step 0. Your entire output must start with the key-value pair block.
- The resume content MUST begin immediately after the \`---RESUME_START---\` separator.
- The resume content part MUST start with the heading \`PROFESSIONAL SUMMARY\`.
- Next: \`TOOLS & TECHNOLOGIES\`.
- Next: \`PROFESSIONAL EXPERIENCE\`.
- Under "PROFESSIONAL EXPERIENCE", include **ALL** job entries, fully tailored and rewritten.
- Follow with other sections.
- All headings MUST be plain text, in ALL CAPS.
- The analysis block MUST begin after all resume content.

---
Now, begin.

BASE_RESUME:
---
${resume}
---

TARGET_JD:
---
${jobDescription}
---
  `;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { resume, jobDescription, customPrompt } = req.body;

        if (!resume || !jobDescription) {
            return res.status(400).json({ error: 'Missing resume or jobDescription' });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const prompt = buildPrompt(resume, jobDescription, customPrompt || '');

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');

        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.25,
                maxOutputTokens: 8192,
            },
        });

        for await (const chunk of response) {
            res.write(chunk.text);
        }

        res.end();
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
