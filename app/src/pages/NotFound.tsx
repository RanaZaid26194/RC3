import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/States';
export default function NotFound() {
  return <EmptyState title="Page not found" message="The page you are looking for does not exist." action={<Link className="font-medium text-brand-700 underline" to="/">Go home</Link>} />;
}
