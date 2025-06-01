import * as yup from 'yup';

export const dealSchema = yup.object({
  title: yup.string().required('Deal title is required'),
  value: yup.number()
    .typeError('Value must be a number')
    .positive('Value must be positive')
    .required('Deal value is required'),
  pipeline_id: yup.string().required('Pipeline is required'),
  stage: yup.string().required('Stage is required'),
  contact_ids: yup.array().of(yup.string()),
  owner_id: yup.string().nullable(),
  status: yup.string().oneOf(['open', 'won', 'lost']).default('open'),
  close_date: yup.date().nullable(),
  notes: yup.string().nullable()
});

export default dealSchema;
