import axios from "axios";

interface IGenerateAccount {
  first_name: string;
  last_name: string;
  phone: string;
  amount: string;
  email: string;
}

export const generateAccount = async (payload: IGenerateAccount) => {
  try {
    const {first_name, last_name, phone, amount, email} = payload

    const response = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET_KEY}`,
      },
      url: `${process.env.RAVEN_BASE_URL}/v1/pwbt/generate_account`,
      data: {
        first_name,
        last_name,
        phone,
        amount,
        email
      },
    });
  } catch (error) {}
};
