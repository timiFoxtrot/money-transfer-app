import axios from "axios";

interface IGenerateAccount {
  first_name: string;
  last_name: string;
  phone: string;
  amount: string;
  email: string;
}

interface ITransfer {
  amount: string;
  bank_code: string;
  bank: string;
  account_number: string;
  account_name: string;
  narration: string;
  reference?: string;
  currency: string;
}

export const generateAccount = async (payload: IGenerateAccount) => {
  try {
    const { first_name, last_name, phone, amount, email } = payload;

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
        email,
      },
    });

    return response.data;
  } catch (error: any) {
    return {
      status: "error",
      message: error.response.data || error,
    };
  }
};

export const transferFunds = async (payload: ITransfer) => {
  try {
    const {
      amount,
      bank_code,
      bank,
      account_name,
      account_number,
      narration,
      currency,
    } = payload;

    const data = {
      amount,
      bank_code,
      bank,
      account_name,
      account_number,
      narration,
      currency,
    };

    const response = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RAVEN_SECRET_KEY}`,
      },
      url: `${process.env.RAVEN_BASE_URL}/v1/transfers/create`,
      data,
    });

    return response.data;
  } catch (error: any) {
    return {
      status: "error",
      message: error.response.data || error,
    };
  }
};

/**
 * {
 *  status: 200,
 *  statusText: OK,
 *  data: {
 *    status: "success",
 *    message: 'account generated successfully'
 *    data: {}
 *  }
 * }
 */
