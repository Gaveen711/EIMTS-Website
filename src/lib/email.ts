import nodemailer from "nodemailer";

type ApplicationEmail = {
  jobTitle: string;
  fullName: string;
  age: number;
  email: string;
  phone: string | null;
  cvFileName: string;
  cvContentType: string;
  cvBytes: ArrayBuffer;
};

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.APPLICATIONS_EMAIL_TO,
  );
}

export async function sendApplicationEmail(application: ApplicationEmail) {
  if (!isEmailConfigured()) {
    return { sent: false as const, reason: "Email is not configured." };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const lines = [
    `Vacancy: ${application.jobTitle}`,
    `Name: ${application.fullName}`,
    `Age: ${application.age}`,
    `Email: ${application.email}`,
    `Phone: ${application.phone || "Not provided"}`,
    "",
    "The candidate's CV is attached.",
  ];

  await transporter.sendMail({
    from:
      process.env.APPLICATIONS_EMAIL_FROM ||
      `"Emerald Isle Website" <${process.env.SMTP_USER}>`,
    to: process.env.APPLICATIONS_EMAIL_TO,
    replyTo: application.email,
    subject: `New application — ${application.jobTitle} — ${application.fullName}`,
    text: lines.join("\n"),
    attachments: [
      {
        filename: application.cvFileName,
        content: Buffer.from(application.cvBytes),
        contentType: application.cvContentType,
      },
    ],
  });

  return { sent: true as const };
}
