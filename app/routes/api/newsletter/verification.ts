import { verifySignedToken } from "@/lib/token";
import { href, redirect } from "react-router";
import type { Route } from "./+types/verification";
import { resend } from "@/lib/resend.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    throw "No token provided";
  }

  const email = verifySignedToken(token);

  if (!email) {
    throw "Wrong token";
  }

  try {
    // Check if the contact already exists
    const { data } = await resend.contacts.get({
      email,
      audienceId: "1a231b09-a625-43c1-9cc2-5d8f34972bdb",
    });

    if (data) {
      return redirect(
        `${href("/newsletter/confirmation")}?alreadySubscribed=true`,
      );
    }

    const { error } = await resend.contacts.create({
      email,
      audienceId: "1a231b09-a625-43c1-9cc2-5d8f34972bdb",
    });

    if (error) {
      console.error("Error adding contact:", error);
      throw "Error adding contact";
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    throw "Error verifying token";
  }
  return redirect(href("/newsletter/confirmation"));
}
