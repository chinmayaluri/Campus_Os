# CampusOS — Shared Backend Contract

**Status:** Initial proposal for team review
**Owner:** M2 — Backend, Database and Security

## 1. User Roles

- `student` — submits event participation requests and views their own requests and attendance.
- `proctor` — reviews requests assigned to them and submits recommendations.
- `eventAdmin` — makes the final decision on event participation requests.

Roles must be verified by trusted backend logic. The frontend alone must not grant permissions.

## 2. Event Request Statuses

Allowed status values:

- `submitted`
- `underProctorReview`
- `recommended`
- `pendingFinalDecision`
- `approved`
- `rejected`
- `returnedForCorrection`

A proctor recommendation is not a final approval. Only an authorized event administrator can make the final decision.

## 3. Shared Service Interfaces

The following names are proposed interfaces, not implemented functions yet.

- `submitEventRequest(data)`
- `getMyEventRequests()`
- `getAssignedProctorRequests()`
- `submitProctorRecommendation(requestId, data)`
- `finalizeEventDecision(requestId, data)`
- `getStudentAttendance(studentId)`
- `importAttendance(records)`

Every service must verify authentication, authorization, input validity, and the requested status transition.

## 4. Event Request Input

Required fields:

- `eventName` — non-empty event name.
- `organizer` — non-empty organizer name.
- `eventDate` — event date in the agreed format.
- `purpose` — reason for participating.

The backend must associate the request with the authenticated student rather than trusting a student ID supplied by the browser.

## 5. Proctor Review Input

- `recommendation` — `recommend` or `doNotRecommend`.
- `remarks` — explanation of the recommendation.

Only the assigned proctor may review a request, and only while it is in an eligible review status.

## 6. Final Decision Input

- `decision` — `approved`, `rejected`, or `returnedForCorrection`.
- `remarks` — explanation of the decision.

Only an authorized event administrator may finalize a request in an eligible status.

## 7. Attendance Input

- `studentId`
- `classesAttended`
- `classesConducted`
- `dataAsOf`

Validation rules:

- `classesConducted` must be greater than zero.
- `classesAttended` must be between zero and `classesConducted`, inclusive.
- Attendance percentage is calculated as `(classesAttended / classesConducted) * 100`.
- Missing or stale attendance data must be flagged rather than silently treated as zero.
- The attendance eligibility threshold must be confirmed with the team; 75% is only an example until confirmed.

## 8. Audit and Security

Record important actions, including request submission, proctor recommendation, final decision, and attendance import.

Each audit entry should identify the actor, action, affected request or import, and timestamp.

Sensitive authorization and status-transition checks must run in trusted backend logic. Firestore Security Rules must prevent users from changing protected fields or bypassing the approval workflow.

## 9. Team Agreement

This document is an initial proposal. M1 (frontend) and M3 (attendance/import) should review the names and fields before implementation depends on them.

Changes to the shared contract should be communicated to all team members and committed through the team's agreed Git workflow.