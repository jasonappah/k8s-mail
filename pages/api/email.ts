import type { NextApiRequest, NextApiResponse } from "next";
import getCluster from "../../getCluster";
import verify from "../../webhookVerify";

interface StoredMessageWebhook {
  //   event: "stored";
  id: string;
  "log-level": string;
  flags: {
    "is-test-mode": boolean;
  };
  subject: string;
  message: {
    headers: {
      to: string;
      "message-id": string;
    };
    // TODO Type this properly lol
    attachments: unknown[];
    recipients: string[];
    size: number;
  };
  sender: string;
  storage: {
    url: string;
    key: string;
  };
  campaigns: unknown[];
  tags: unknown[];
  "user-variables": unknown;
  timestamp: string;
  token: string;
  signature: string;
}

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

function isRealHookPayload(o: unknown): o is StoredMessageWebhook {
  const p = o as StoredMessageWebhook;
  if (!p) return false;
  if (!p?.signature) {
    return false;
  }
  console.log(p.signature);
  return verify(
    process.env.MAILGUN_API_KEY || "",
    p?.timestamp,
    p?.token,
    p?.signature
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isRealHookPayload(req.body)) {
    console.log("VER FAIL");
    return res.status(406).json({
      error: "Not a valid payload",
    });
  }
  console.log("YUH");
  const [clusterHost] = await getCluster();
  // TODO: make this do k8s stuff
  console.log(req.body);
  const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  const [method, endpoint] = req.body.subject.split(" ");
  if (!METHODS.includes(method.toUpperCase())) {
    return res.status(406).json({
      error: "Not a valid method",
    });
  }
//   Pretend this doesn't exist
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  const r = await fetch(
    new URL(endpoint, clusterHost).href
  );
  const out = await r.text();
  res.status(200).json({ out });

  const sender = req.body.sender;
  const subject = req.body.subject;
  const text = out;

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      to: [sender],
      text: text + `\n\nFrom cluster host ${clusterHost}.`,
      subject: `Re: ${subject}`,
      from: process.env.MAILGUN_FROM,
    });
  } catch (e) {
    console.error("MG", e);
  }
}

const sample = {
  event: "stored",
  id: "WRVmVc47QYi4DHth_xpRUA",
  timestamp: 1529692198.691758,
  "log-level": "info",
  flags: {
    "is-test-mode": false,
  },
  message: {
    headers: {
      to: "team@example.org",
      "message-id": "20180622182958.1.48906CB188F1A454@exmple.org",
      from: "sender@example.org",
      subject: "Test Subject",
    },
    attachments: [],
    recipients: ["team@example.org"],
    size: 586,
  },
  storage: {
    url: "https://se.api.mailgun.net/v3/domains/example.org/messages/eyJwI...",
    key: "eyJwI...",
  },
  campaigns: [],
  tags: [],
  "user-variables": {},
};
