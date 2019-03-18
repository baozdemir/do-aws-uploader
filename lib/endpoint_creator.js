const env = {
    aws: "amazonaws.com",
    do: "digitaloceanspaces.com"
};

module.exports = (cloud, region, bucket) => {
    let sUrl = "https://";
    const baseUrl = env[cloud];
    const region_ = cloud === "aws" && region === "us-east-1" ? "" : region + ".";

    if (cloud === "aws") {
        sUrl += "s3-";
    }
    return {
        remoteUrl: `${sUrl}${region_}${baseUrl}/${bucket}/`,
        endpoint: `${sUrl}${region_}${baseUrl}/`
    };
};
