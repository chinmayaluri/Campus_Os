
import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

initializeApp();

setGlobalOptions({maxInstances: 10});

const db = getFirestore();

export const submitEventRequest = onCall(async (request) => {
  // Require the student to be signed in.
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must sign in to submit an event request."
    );
  }

  // Validate the submitted fields.
  const {eventName, organizer, eventDate, purpose} = request.data ?? {};

  if (
    typeof eventName !== "string" ||
    !eventName.trim() ||
    typeof organizer !== "string" ||
    !organizer.trim() ||
    typeof eventDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
    typeof purpose !== "string" ||
    !purpose.trim()
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Provide a valid event name, organizer, date (YYYY-MM-DD), and purpose."
    );
  }

  // Create the request using the authenticated student's UID.
  const doc = await db.collection("eventRequests").add({
    studentId: request.auth.uid,
    eventName: eventName.trim(),
    organizer: organizer.trim(),
    eventDate,
    purpose: purpose.trim(),
    status: "submitted",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    requestId: doc.id,
    status: "submitted",
  };
});
