// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  const resp = await fetch("http://34.136.66.166:3333/question").then(
    async (resp) => await resp.json(),
  );
  res.status(200).json(resp);
}
