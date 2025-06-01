import { useParams } from 'react-router-dom';
import ContactDetail from '@/components/contacts/ContactDetail';

const ContactDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container py-6">
      <ContactDetail />
    </div>
  );
};

export default ContactDetailPage;
