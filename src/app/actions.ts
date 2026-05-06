"use server";

export async function sendContactForm(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const service = formData.get("service");

  // For Phase 1, we log to console. 
  // In Phase 2, we will integrate with Resend/Formspree.
  console.log("New Lead Received:", { name, email, message, service });

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Thank you! Your message has been received. We'll get back to you soon.",
  };
}
