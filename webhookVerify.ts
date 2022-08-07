import crypto from "node:crypto";

const verify = (
  signingKey: string,
  timestamp: string,
  token: string,
  signature: string
) => {
  const encodedToken = crypto
    .createHmac("sha256", signingKey)
    .update(timestamp.concat(token))
    .digest("hex");
  console.log(signingKey, timestamp, token, signature, encodedToken);

  return encodedToken === signature;
};

export default verify;
