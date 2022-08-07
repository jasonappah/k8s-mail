import type { NextApiRequest, NextApiResponse } from "next";
import getCluster from "../../getCluster";
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const [clusterHost, clusterName] = await getCluster();
  res.status(200).json({ clusterHost, clusterName });
}
