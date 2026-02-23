import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  qr_value: string;
  room_number: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ username: string; email: string; email_verified: boolean } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/.netlify/functions/get-current-user', {
          credentials: 'include',
        });
        
        if (!userRes.ok) {
          navigate('/login');
          return;
        }

        const userData = await userRes.json();
        setUser(userData.user);

        const ordersRes = await fetch('/.netlify/functions/get-user-orders', {
          credentials: 'include',
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/.netlify/functions/logout', {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </div>

        {user && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Account Info</h2>
            <div className="space-y-2">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p>
                <strong>Status:</strong>{' '}
                {user.email_verified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Not Verified</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">My Orders</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Order #{order.id?.slice(0, 8) || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date not available'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items?.length || 0} item(s) • QR: {order.qr_value || 'N/A'} • Room: {order.room_number || 'N/A'}
                  </div>
                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
