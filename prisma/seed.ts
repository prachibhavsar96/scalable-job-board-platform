import { ApplicationStatus, JobType, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seededCompanyNames = ["Acme Software", "Northstar Health"];
const seededUserEmails = [
  "employer.acme@example.com",
  "employer.northstar@example.com",
  "candidate.jane@example.com",
  "candidate.miguel@example.com",
  "candidate.aisha@example.com",
];

async function clearSeededData() {
  await prisma.application.deleteMany({
    where: {
      OR: [
        {
          user: {
            email: {
              in: seededUserEmails,
            },
          },
        },
        {
          job: {
            company: {
              name: {
                in: seededCompanyNames,
              },
            },
          },
        },
      ],
    },
  });

  await prisma.job.deleteMany({
    where: {
      company: {
        name: {
          in: seededCompanyNames,
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: seededUserEmails,
      },
    },
  });

  await prisma.company.deleteMany({
    where: {
      name: {
        in: seededCompanyNames,
      },
    },
  });
}

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await clearSeededData();

  const acmeEmployer = await prisma.user.create({
    data: {
      name: "Eli Employer",
      email: "employer.acme@example.com",
      password,
      role: Role.EMPLOYER,
    },
  });

  const northstarEmployer = await prisma.user.create({
    data: {
      name: "Nora Recruiter",
      email: "employer.northstar@example.com",
      password,
      role: Role.EMPLOYER,
    },
  });

  const acme = await prisma.company.create({
    data: {
      name: "Acme Software",
      description: "A product engineering company building workflow tools.",
      location: "Denver, CO",
      employerId: acmeEmployer.id,
    },
  });

  const northstar = await prisma.company.create({
    data: {
      name: "Northstar Health",
      description: "A healthcare technology team improving patient operations.",
      location: "Austin, TX",
      employerId: northstarEmployer.id,
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: "Jane Candidate",
      email: "candidate.jane@example.com",
      password,
      role: Role.CANDIDATE,
    },
  });

  const miguel = await prisma.user.create({
    data: {
      name: "Miguel Rivera",
      email: "candidate.miguel@example.com",
      password,
      role: Role.CANDIDATE,
    },
  });

  const aisha = await prisma.user.create({
    data: {
      name: "Aisha Patel",
      email: "candidate.aisha@example.com",
      password,
      role: Role.CANDIDATE,
    },
  });

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "Junior Backend Developer",
        description: "Build REST APIs with Node.js, Express, and Prisma.",
        location: "Remote",
        salaryMin: 60000,
        salaryMax: 85000,
        jobType: JobType.FULL_TIME,
        companyId: acme.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Frontend Engineer",
        description: "Create polished React interfaces for hiring workflows.",
        location: "Denver, CO",
        salaryMin: 75000,
        salaryMax: 105000,
        jobType: JobType.FULL_TIME,
        companyId: acme.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "DevOps Contractor",
        description: "Improve deployment pipelines and cloud observability.",
        location: "Seattle, WA",
        salaryMin: 90000,
        salaryMax: 125000,
        jobType: JobType.CONTRACT,
        companyId: acme.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Product Design Intern",
        description: "Support user research, wireframes, and design QA.",
        location: "Boulder, CO",
        salaryMin: 22000,
        salaryMax: 32000,
        jobType: JobType.INTERNSHIP,
        companyId: acme.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Healthcare Data Analyst",
        description: "Analyze patient operations data and build dashboards.",
        location: "Austin, TX",
        salaryMin: 70000,
        salaryMax: 95000,
        jobType: JobType.FULL_TIME,
        companyId: northstar.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Part-Time QA Tester",
        description: "Test API and web releases for healthcare operations tools.",
        location: "Remote",
        salaryMin: 30000,
        salaryMax: 45000,
        jobType: JobType.PART_TIME,
        companyId: northstar.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Clinical Systems Engineer",
        description: "Integrate internal systems with partner healthcare APIs.",
        location: "Chicago, IL",
        salaryMin: 95000,
        salaryMax: 135000,
        jobType: JobType.FULL_TIME,
        companyId: northstar.id,
      },
    }),
    prisma.job.create({
      data: {
        title: "Technical Support Specialist",
        description: "Help customers troubleshoot workflow and account issues.",
        location: "Phoenix, AZ",
        salaryMin: 48000,
        salaryMax: 65000,
        jobType: JobType.PART_TIME,
        companyId: northstar.id,
      },
    }),
  ]);

  await prisma.application.createMany({
    data: [
      {
        userId: jane.id,
        jobId: jobs[0].id,
        resumePath: "https://example.com/resumes/jane-backend.pdf",
        coverLetter: "I enjoy building clean APIs and would love to join Acme.",
        status: ApplicationStatus.APPLIED,
      },
      {
        userId: jane.id,
        jobId: jobs[4].id,
        resumePath: "https://example.com/resumes/jane-data.pdf",
        coverLetter: "My backend experience pairs well with healthcare data.",
        status: ApplicationStatus.REVIEWED,
      },
      {
        userId: miguel.id,
        jobId: jobs[1].id,
        resumePath: "https://example.com/resumes/miguel-frontend.pdf",
        coverLetter: "I build accessible interfaces and enjoy product teams.",
        status: ApplicationStatus.APPLIED,
      },
      {
        userId: miguel.id,
        jobId: jobs[5].id,
        resumePath: "https://example.com/resumes/miguel-qa.pdf",
        coverLetter: "I have strong testing habits and clear bug reports.",
        status: ApplicationStatus.ACCEPTED,
      },
      {
        userId: aisha.id,
        jobId: jobs[6].id,
        resumePath: "https://example.com/resumes/aisha-systems.pdf",
        coverLetter: "I have experience integrating APIs in regulated domains.",
        status: ApplicationStatus.REJECTED,
      },
    ],
  });

  console.log("Seed data created:");
  console.log("- 2 companies");
  console.log("- 2 employer users");
  console.log("- 3 candidate users");
  console.log("- 8 jobs");
  console.log("- 5 applications");
  console.log("Seed password for all users: password123");
  console.log(`Employer reference users: ${acmeEmployer.email}, ${northstarEmployer.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
