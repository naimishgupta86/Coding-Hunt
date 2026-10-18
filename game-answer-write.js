import http from "k6/http";
import { check, sleep } from "k6";

const teams = [
  "CH-363490",
  "CH-357181",
  "CH-351902",
  "CH-346064",
  "CH-340100",
  "CH-332920",
  "CH-326979",
  "CH-320943",
  "CH-315574",
  "CH-309230",
  "CH-303497",
  "CH-294100",
  "CH-288710",
  "CH-283091",
  "CH-275440",
  "CH-264518",
  "CH-255613",
  "CH-249255",
  "CH-242667",
  "CH-237027",
  "CH-231418",
  "CH-224802",
  "CH-219922",
  "CH-214771",
  "CH-209479",
  "CH-204281",
  "CH-198724",
  "CH-192938",
  "CH-187080",
  "CH-181643",
  "CH-172518",
  "CH-167769",
  "CH-163040",
  "CH-157417",
  "CH-152506",
  "CH-146882",
  "CH-137993",
  "CH-132442",
  "CH-126799",
  "CH-121665",
  "CH-116602",
  "CH-111373",
  "CH-105626",
  "CH-100427",
  "CH-088367",
  "CH-076229",
  "CH-070468",
  "CH-059799",
  "CH-054178",
  "CH-612717",
  "CH-094234",
];

const questionId = "6a96dae9fe06540ff4b33ceb";

export const options = {
  vus: 50,
  duration: "30s",
};

export default function () {
  const teamId = teams[(__VU - 1) % teams.length];

  const body = JSON.stringify({
    teamId,
    questionId,
    answer: "A",
  });

  const response = http.post(
    "http://localhost:5000/api/game/answer",
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let data = {};

  try {
    data = response.json();
  } catch (error) {
    console.log(
      `INVALID JSON | Team: ${teamId} | Status: ${response.status} | Body: ${response.body}`
    );
  }

  const success = response.status === 200 && data.success === true;

  check(response, {
    "status is 200": (r) => r.status === 200,
    "request successful": () => success,
    "has correct field": () => data.correct !== undefined,
  });

  if (!success) {
    console.log(
      `FAILED | Team: ${teamId} | Status: ${response.status} | Message: ${
        data.message || response.body
      }`
    );
  }

  sleep(1);
}