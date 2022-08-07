import { readFile } from "fs/promises";
import path from "path";
import YAML from "yaml";
import { homedir } from "os";

const getCluster = async () => {
  const kc = YAML.parse(
    await readFile(
      process.env.KUBECONFIG || path.join(homedir(), ".kube/config"),
      "utf8"
    ),
    {}
  );

  if (!Array.isArray(kc.clusters) || kc.clusters.length < 1)
    throw new Error("No clusters found in kubeconfig");
  return [kc.clusters[0].cluster.server, kc.clusters[0].name];
};

export default getCluster;
