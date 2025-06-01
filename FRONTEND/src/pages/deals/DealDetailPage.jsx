import { useParams } from 'react-router-dom';
import DealDetail from '@/components/deals/DealDetail';
import useQuery from '@/hooks/useQuery';

const DealDetailPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container py-6">
      <DealDetail />
    </div>
  );
};

export default DealDetailPage;
