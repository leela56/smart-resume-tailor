import React from 'react';

export const SampleResume: React.FC = () => {
  return (
    <div className="bg-stone-100 p-4 h-full flex items-center justify-center">
      <div className="animate-fade-in bg-white w-full max-w-3xl shadow-lg p-8 min-h-[800px] rounded-sm">
        <h2 className="text-center text-lg font-bold text-stone-400 mb-8 tracking-wider">
          SAMPLE OUTPUT RESUME
        </h2>
        {/* Header - Styled to match PDF output */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <h1 className="text-xl font-bold text-stone-900">Jane Doe</h1>
            <p className="text-stone-700">Senior Software Engineer</p>
            <p className="text-stone-600">San Francisco, CA</p>
          </div>
          <div className="text-right text-stone-600 text-sm">
            <p>(123) 456-7890</p>
            <p>jane.doe@email.com</p>
            <p>linkedin.com/in/janedoe</p>
          </div>
        </div>
        <hr className="border-stone-300 mb-6" />

        {/* Professional Summary */}
        <div className="mb-4">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-stone-800 text-sm leading-relaxed">
            Dynamic and results-oriented Senior Software Engineer with over 8 years of experience in designing and implementing scalable cloud solutions. Proficient in agile methodologies and experienced in leading cross-functional teams to deliver high-quality software. Proven ability to optimize application performance and enhance user experience through data-driven insights. Seeking to leverage expertise in backend development and system architecture to contribute to Target Company's innovative projects. Passionate about building robust systems and mentoring junior developers.
          </p>
        </div>

        {/* Tools & Technologies */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">TOOLS & TECHNOLOGIES</h2>
          <div className="text-stone-800 text-xs sm:text-sm whitespace-pre-wrap font-mono leading-relaxed">
{`Languages: Python, Java, Go, TypeScript, SQL
Cloud Platforms: AWS (EC2, S3, Lambda, RDS), GCP
Databases: PostgreSQL, MongoDB, Redis, DynamoDB
Frameworks: Django, Spring Boot, React, Node.js
DevOps & CI/CD: Docker, Kubernetes, Jenkins, Terraform
Monitoring: Prometheus, Grafana, Datadog, ELK Stack`}
          </div>
        </div>

        {/* Professional Experience */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">PROFESSIONAL EXPERIENCE</h2>
          <div className="mt-3">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-stone-900">Tech Solutions Inc., San Francisco, CA</h3>
              <span className="text-stone-600 text-xs">Jan 2020 – Present</span>
            </div>
            <p className="font-bold text-stone-800 text-sm">Senior Software Engineer</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-800 text-sm">
              <li>Led the development of a microservices architecture, improving system scalability by 200% and reducing latency by 30% for over 1 million users.</li>
              <li>Engineered a CI/CD pipeline using Jenkins and Docker, which decreased deployment times from 2 hours to 15 minutes and improved developer productivity.</li>
              <li>Mentored a team of 4 junior engineers, fostering a culture of collaboration and high-quality code standards, leading to a 25% reduction in production bugs.</li>
            </ul>
          </div>
        </div>

        {/* Projects */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">PROJECTS</h2>
          <div className="mt-2">
            <h3 className="font-bold text-stone-900 text-sm">Real-Time Analytics Dashboard</h3>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-800 text-sm">
              <li>Developed a full-stack dashboard using React and Go to visualize user engagement metrics, providing key stakeholders with actionable insights.</li>
            </ul>
          </div>
        </div>
        
        {/* Volunteer Experience */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">VOLUNTEER EXPERIENCE</h2>
           <div className="mt-2">
            <h3 className="font-bold text-stone-900 text-sm">Code for America | Mentor</h3>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-800 text-sm">
              <li>Guided aspiring developers through coding bootcamps, helping them build their portfolios and prepare for technical interviews.</li>
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">EDUCATION</h2>
          <div className="mt-2">
            <table className="w-full text-stone-800 text-sm border-separate" style={{borderSpacing: '0 0.5rem'}}>
                <tbody>
                    <tr>
                        <td className="text-left font-semibold text-stone-900 align-top pr-4">Stanford University</td>
                        <td className="text-center align-top px-4">M.S. in Computer Science</td>
                        <td className="text-right text-stone-600 align-top pl-4">2020 - 2022</td>
                    </tr>
                    <tr>
                        <td className="text-left font-semibold text-stone-900 align-top pr-4">University of California, Berkeley</td>
                        <td className="text-center align-top px-4">B.S. in Computer Science</td>
                        <td className="text-right text-stone-600 align-top pl-4">2016 - 2020</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-6">
          <h2 className="font-bold text-base text-stone-900 mb-2 border-b border-stone-200 pb-1">CERTIFICATIONS</h2>
          <div className="mt-2">
            <ul className="list-disc pl-5 mt-1 space-y-1 text-stone-800 text-sm">
              <li>AWS Certified Solutions Architect – Associate</li>
              <li>Certified Kubernetes Application Developer (CKAD)</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-8 text-stone-400 italic text-xs pb-4">
          This is a sample resume to demonstrate the app's features.
        </div>

      </div>
    </div>
  );
};