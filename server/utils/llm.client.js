import axios from 'axios';

export const submitCode = async ({ source, language_id, stdin }) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
    { source_code: source, language_id, stdin }
  );
  return data;               // contains stdout, stderr, status
};
