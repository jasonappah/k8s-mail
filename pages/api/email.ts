import type { NextApiRequest, NextApiResponse } from "next";
import getCluster from "../../getCluster";

interface StoredMessageWebhook {
  event: "stored";
  id: string;
  timestamp: number;
  "log-level": string;
  flags: {
    "is-test-mode": boolean;
  };
  message: {
    headers: {
      to: string;
      "message-id": string;
      from: string;
      subject: string;
    };
    // TODO Type this properly lol
    attachments: unknown[];
    recipients: string[];
    size: number;
  };
  storage: {
    url: string;
    key: string;
  };
  campaigns: unknown[];
  tags: unknown[];
  "user-variables": unknown;
}

import { promisify } from "util";

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

function thing(p: unknown): p is StoredMessageWebhook {
  if (!p) return false;
  if (!p?.event || p?.event !== "stored") return false;
  // TODO: Theres gotta be some way to verify sigs somehweer
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    console.log("yuh", req.body);
  // if () {

  // }
  const [clusterHost] = await getCluster();
  // TODO: make this do k8s stuff
  const r = await fetch("https://api.github.com/repos/zeit/next.js");
  const out = await r.text();
  res.status(200).json({ out });

  const sender = "hey@jasonaa.me";
  const subject = "Hello";
  const text = "sup";
  
  try {
    // TODO: send an email in response
    const t = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      to: [sender],
      text: text + `\n\nFrom cluster host ${clusterHost}.`,
      subject: `Re: ${subject}`,
      from: process.env.MAILGUN_FROM,
    });
  } catch (e) {
    console.error("MG",e);
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
