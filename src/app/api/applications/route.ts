import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function failure(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    return failure(
      "Online applications are being configured. Please email your CV to cv@emeraldisle.lk.",
      503,
    );
  }

  const formData = await request.formData();
  const jobId = String(formData.get("job_id") || "");
  const fullName = String(formData.get("name") || "").trim();
  const age = Number(formData.get("age"));
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const cv = formData.get("cv");

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      jobId,
    )
  ) {
    return failure("This vacancy is not yet accepting online applications.");
  }
  if (!fullName || !email || !Number.isInteger(age) || age < 18 || age > 99) {
    return failure("Please complete all required application details.");
  }
  if (!(cv instanceof File) || !cv.size) {
    return failure("Please attach your CV.");
  }
  if (cv.size > 5 * 1024 * 1024) {
    return failure("Your CV must be 5 MB or smaller.");
  }
  if (!allowedTypes.has(cv.type)) {
    return failure("Please upload a PDF, DOC or DOCX CV.");
  }

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });
  const extension = cv.name.split(".").pop()?.toLowerCase() || "bin";
  const cvPath = `${jobId}/${crypto.randomUUID()}.${extension}`;
  const bytes = await cv.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("candidate-cvs")
    .upload(cvPath, bytes, {
      contentType: cv.type,
      upsert: false,
    });

  if (uploadError) {
    return failure(
      "We could not upload your CV. Please try again or email cv@emeraldisle.lk.",
      500,
    );
  }

  const { error: applicationError } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      full_name: fullName,
      age,
      email,
      phone: phone || null,
      cv_path: cvPath,
    });

  if (applicationError) {
    return failure(
      "We could not save your application. Please email cv@emeraldisle.lk.",
      500,
    );
  }

  return NextResponse.json({
    message: "Application submitted successfully.",
  });
}
