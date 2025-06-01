import * as yup from 'yup';

export const contactSchema = yup.object({
  name: yup.string().required('Contact name is required'),
  email: yup.string().email('Please enter a valid email').nullable(),
  phone: yup.string().nullable(),
  notes: yup.string().nullable(),
  owner_id: yup.string().nullable()
});

export default contactSchema;
