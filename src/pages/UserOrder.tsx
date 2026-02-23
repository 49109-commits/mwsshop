import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  qr_value: string;
  room_number: string;
  status: string;
  created_at: string;
}

export default function UserOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        console.log('Fetching order:', orderId);
        const response = await fetch(`/.netlify/functions/get-order?id=${orderId}`, {
          credentials: 'include',
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Order not found or access denied');
            return;
          }
          if (response.status === 401) {
            setError('Please log in to view this order');
            return;
          }
          throw new Error(`Failed to fetch order: ${response.status}`);
        }

        const data = await response.json();
        console.log('Order data received:', data);
        
        if (data.order) {
          // Ensure items is an array
          const orderData = {
            ...data.order,
            items: Array.isArray(data.order.items) ? data.order.items : []
          };
          setOrder(orderData);
        } else {
          setError('Order data not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/.netlify/functions/delete-order?id=${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to cancel order');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/dashboard" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const total = order.items && Array.isArray(order.items) 
    ? order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link to="/dashboard" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id?.slice(0, 8) || 'Unknown'}</h1>
              <p className="text-gray-500">
                {order.created_at ? `Placed on ${new Date(order.created_at).toLocaleDateString()}` : 'Date not available'}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              {order.status}
            </span>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Room Number:</p>
              <p className="text-xl font-semibold">{order.room_number || 'N/A'}</p>
            </div>
            <p className="text-sm text-gray-600">Order QR Code:</p>
            <p className="text-2xl font-mono font-bold text-primary">{order.qr_value || 'N/A'}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Items</h2>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name || 'Unknown Item'}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                    </div>
                    <p className="font-semibold">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items in this order</p>
            )}
            <div className="mt-4 pt-2 border-t flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
