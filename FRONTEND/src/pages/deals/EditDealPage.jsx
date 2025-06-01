import { useParams } from "react-router-dom";
import DealForm from "@/components/deals/DealForm";
import useQuery from "@/hooks/useQuery";
import moment from "moment";

const EditDealPage = () => {
  const { id } = useParams();
  const { data, loading } = useQuery(`/api/v1/deals/${id}`);
  const deal = data?.data?.data || null;

  return (
    <div className="container py-6">
      {loading ? (
        <div className="text-center py-10">Loading deal details...</div>
      ) : (
        <DealForm initialData={deal} isEdit={true} />
      )}
    </div>
  );
};

export default EditDealPage;
