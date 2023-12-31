import axios from 'axios';
import { showAlert } from './alerts.js';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      url,
      method: 'PATCH',
      data,
    });
    showAlert('success', `${type.toUpperCase()} updated successfully`);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
