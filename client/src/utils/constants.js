export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
};

// Map category names to React Icon names (using FontAwesome)
export const CATEGORY_ICONS = {
  'Programming': 'FaCode',
  'Artificial Intelligence': 'FaBrain',
  'Machine Learning': 'FaRobot',
  'Data Science': 'FaChartBar',
  'Fantasy': 'FaMagic',
  'Romance': 'FaHeart',
  'Mystery': 'FaSearch',
  'Thriller': 'FaUserSecret',
  'Science Fiction': 'FaRocket',
  'Horror': 'FaGhost',
  'Biography': 'FaUser',
  'Business': 'FaBriefcase',
  'Self-Help': 'FaLightbulb',
  "Children's Books": 'FaChild',
  'Comics': 'FaSmile',
  'Academic': 'FaGraduationCap',
  'Engineering': 'FaCog',
  'Competitive Exams': 'FaClipboardList',
  'Poetry': 'FaPenNib',
  'Religion': 'FaPray',
  'Health': 'FaHeartbeat',
  'Cooking': 'FaUtensils',
  'History': 'FaHistory',
  'Travel': 'FaMapMarkedAlt',
  'Technology': 'FaLaptop',
};
