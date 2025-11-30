import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

type View = 'feed' | 'profile' | 'friends' | 'messages' | 'notifications' | 'music';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  time: string;
  replies: Comment[];
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: Comment[];
  time: string;
  shares?: number;
  isRepost?: boolean;
  originalAuthor?: string;
}

interface Friend {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  media?: string;
  mediaType?: 'image' | 'video';
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
}

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'friend';
  user: string;
  content: string;
  time: string;
}

interface SearchUser {
  id: number;
  name: string;
  avatar: string;
  mutualFriends: number;
}

interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  work: string;
  friends: number;
  photos: number;
  followers: number;
  status: 'online' | 'offline';
  posts: Post[];
}

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
}

const Index = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Вася Иванов', avatar: 'ВИ' });
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState(false);
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [subscribedUsers, setSubscribedUsers] = useState<Set<number>>(new Set());
  const [viewingImage, setViewingImage] = useState<{ url: string; format: string } | null>(null);
  const [imageViewMode, setImageViewMode] = useState<'fit' | 'fill' | 'original'>('fit');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState<Friend[]>([
    { id: 1, name: 'Анна Петрова', avatar: 'АП', status: 'online' },
    { id: 2, name: 'Дмитрий Иванов', avatar: 'ДИ', status: 'online' },
    { id: 3, name: 'Мария Сидорова', avatar: 'МС', status: 'offline' },
    { id: 4, name: 'Алексей Смирнов', avatar: 'АС', status: 'offline' },
    { id: 5, name: 'Елена Козлова', avatar: 'ЕК', status: 'online' },
    { id: 6, name: 'Сергей Волков', avatar: 'СВ', status: 'offline' }
  ]);
  const [settings, setSettings] = useState({
    privacy: {
      profileVisibility: 'everyone',
      postsVisibility: 'friends',
      friendsVisibility: 'friends'
    },
    notifications: {
      likes: true,
      comments: true,
      friendRequests: true,
      messages: true
    },
    interface: {
      language: 'ru',
      fontSize: 'medium'
    },
    security: {
      twoFactor: false
    }
  });
  const [newMessage, setNewMessage] = useState('');
  const [messageMediaFile, setMessageMediaFile] = useState<File | null>(null);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{ postId: number; commentId: number; author: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [profileEdit, setProfileEdit] = useState({ 
    name: 'Вася Иванов', 
    bio: 'Люблю создавать красивые и функциональные веб-приложения. В свободное время увлекаюсь фотографией и путешествиями.', 
    location: 'Москва, Россия', 
    work: 'IT Company' 
  });
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Анна Петрова',
      avatar: 'АП',
      content: 'Отличная погода сегодня! Провела весь день в парке 🌳',
      image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
      likes: 24,
      shares: 3,
      comments: [
        { id: 101, author: 'Дмитрий', avatar: 'Д', content: 'Красиво! Где это?', likes: 3, time: '1 час назад', replies: [] },
        { id: 102, author: 'Мария', avatar: 'М', content: 'Согласна, погода шикарная!', likes: 5, time: '30 мин назад', replies: [] }
      ],
      time: '2 часа назад'
    },
    {
      id: 2,
      author: 'Дмитрий Иванов',
      avatar: 'ДИ',
      content: 'Запустил новый проект! Долго работал над этим, наконец-то готово 🚀',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4',
      likes: 56,
      shares: 12,
      comments: [
        { id: 201, author: 'Елена', avatar: 'Е', content: 'Поздравляю! Молодец!', likes: 8, time: '2 часа назад', replies: [] }
      ],
      time: '4 часа назад'
    }
  ]);

  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, title: 'Summer Vibes', artist: 'DJ Metro', duration: '3:45', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
    { id: 2, title: 'Night Rhythm', artist: 'Beat Maker', duration: '4:12', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
    { id: 3, title: 'Electronic Dreams', artist: 'Synth Wave', duration: '5:03', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
    { id: 4, title: 'Urban Beats', artist: 'City Sound', duration: '3:28', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300' }
  ]);

  useEffect(() => {
    const auth = localStorage.getItem('isAuth');
    if (auth === 'true') setIsAuthenticated(true);
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') setIsDarkMode(true);
  }, []);

  const handleAuth = () => {
    if (username && password) {
      localStorage.setItem('isAuth', 'true');
      setIsAuthenticated(true);
      setCurrentUser({ name: username, avatar: username.substring(0, 2).toUpperCase() });
      toast({ title: authMode === 'login' ? 'Вы вошли в систему' : 'Регистрация успешна' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuth');
    setIsAuthenticated(false);
    toast({ title: 'Вы вышли из системы' });
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    toast({ title: newTheme ? 'Тёмная тема включена' : 'Светлая тема включена' });
  };

  const handleSaveProfile = () => {
    setCurrentUser({ ...currentUser, name: profileEdit.name });
    setIsEditProfileOpen(false);
    toast({ title: 'Профиль обновлён' });
  };

  const handleSendMessage = () => {
    if (!selectedChat || (!newMessage.trim() && !messageMediaFile)) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: 0,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      media: messageMediaFile ? URL.createObjectURL(messageMediaFile) : undefined,
      mediaType: messageMediaFile?.type.startsWith('image/') ? 'image' : messageMediaFile?.type.startsWith('video/') ? 'video' : undefined
    };

    setConversations(conversations.map(conv => {
      if (conv.id === selectedChat) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage.trim() || 'Медиафайл',
          time: newMsg.time
        };
      }
      return conv;
    }));

    setNewMessage('');
    setMessageMediaFile(null);
    toast({ title: 'Сообщение отправлено' });
  };

  const handlePublishPost = () => {
    if (newPost.trim() || mediaFile) {
      toast({ title: 'Пост опубликован' });
      setNewPost('');
      setMediaFile(null);
    }
  };

  const handleAddFriend = (name: string) => {
    toast({ title: `Заявка отправлена ${name}` });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      toast({ title: `Файл загружен: ${e.target.files[0].name}` });
    }
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: number) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now(),
          author: currentUser.name,
          avatar: currentUser.avatar,
          content: text,
          likes: 0,
          time: 'Только что',
          replies: []
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
    
    setCommentText(prev => ({ ...prev, [postId]: '' }));
    toast({ title: 'Комментарий добавлен' });
  };

  const handleReplyToComment = (postId: number, commentId: number) => {
    if (!replyText.trim()) return;

    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const newReply: Comment = {
            id: Date.now(),
            author: currentUser.name,
            avatar: currentUser.avatar,
            content: replyText,
            likes: 0,
            time: 'Только что',
            replies: []
          };
          return { ...comment, replies: [...comment.replies, newReply] };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: addReplyToComment(comment.replies) };
        }
        return comment;
      });
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: addReplyToComment(post.comments) };
      }
      return post;
    }));

    setReplyText('');
    setReplyingTo(null);
    toast({ title: 'Ответ добавлен' });
  };

  const handleSharePost = (post: Post) => {
    const repostedPost: Post = {
      ...post,
      id: Date.now(),
      isRepost: true,
      originalAuthor: post.author,
      author: currentUser.name,
      avatar: currentUser.avatar,
      time: 'Только что',
      shares: 0,
      comments: []
    };
    setPosts([repostedPost, ...posts]);
    toast({ title: 'Пост опубликован на вашей странице' });
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0078D7] hover:underline font-medium"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleLikeComment = (commentId: number) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleLikePost = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    toast({ title: `Играет: ${track.title}` });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRemoveFriend = (friendId: number) => {
    const friend = friendsList.find(f => f.id === friendId);
    setFriendsList(prev => prev.filter(f => f.id !== friendId));
    toast({ title: `${friend?.name} удалён из друзей` });
  };

  const filteredFriends = friendsList.filter(friend => 
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  const allUsers = [
    ...userProfiles,
    ...searchUsers.map(u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      bio: 'Пользователь сети',
      location: 'Россия',
      work: '-',
      friends: u.mutualFriends * 10,
      photos: 0,
      followers: 0,
      status: 'offline' as const,
      posts: []
    }))
  ];

  const filteredSearchResults = globalSearchQuery.trim() 
    ? allUsers.filter(user => 
        user.name.toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    : [];

  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: 1, 
      name: 'Анна Петрова', 
      avatar: 'АП', 
      lastMessage: 'Привет! Как дела?', 
      time: '10:24', 
      unread: 2,
      messages: [
        { id: 1, senderId: 1, senderName: 'Анна Петрова', senderAvatar: 'АП', text: 'Привет! Как твои дела?', time: '10:20' },
        { id: 2, senderId: 0, senderName: 'Вася Иванов', senderAvatar: 'ВИ', text: 'Привет! Отлично, спасибо! У тебя как?', time: '10:22' },
        { id: 3, senderId: 1, senderName: 'Анна Петрова', senderAvatar: 'АП', text: 'Тоже хорошо! Работаю над новым проектом', time: '10:24' }
      ]
    },
    { 
      id: 2, 
      name: 'Дмитрий Иванов', 
      avatar: 'ДИ', 
      lastMessage: 'Увидимся завтра', 
      time: '09:15', 
      unread: 0,
      messages: [
        { id: 4, senderId: 2, senderName: 'Дмитрий Иванов', senderAvatar: 'ДИ', text: 'Привет! Встретимся завтра?', time: '09:10' },
        { id: 5, senderId: 0, senderName: 'Вася Иванов', senderAvatar: 'ВИ', text: 'Да, конечно! Во сколько?', time: '09:12' },
        { id: 6, senderId: 2, senderName: 'Дмитрий Иванов', senderAvatar: 'ДИ', text: 'В 15:00 у кафе. Увидимся завтра', time: '09:15' }
      ]
    },
    { 
      id: 3, 
      name: 'Мария Сидорова', 
      avatar: 'МС', 
      lastMessage: 'Спасибо за помощь!', 
      time: 'Вчера', 
      unread: 1,
      messages: [
        { id: 7, senderId: 3, senderName: 'Мария Сидорова', senderAvatar: 'МС', text: 'Помоги с проектом, пожалуйста', time: 'Вчера' },
        { id: 8, senderId: 0, senderName: 'Вася Иванов', senderAvatar: 'ВИ', text: 'Конечно, чем помочь?', time: 'Вчера' },
        { id: 9, senderId: 3, senderName: 'Мария Сидорова', senderAvatar: 'МС', text: 'Спасибо за помощь!', time: 'Вчера' }
      ]
    }
  ]);

  const notifications: Notification[] = [
    { id: 1, type: 'like', user: 'Анна Петрова', content: 'понравился ваш пост', time: '5 минут назад' },
    { id: 2, type: 'comment', user: 'Дмитрий Иванов', content: 'прокомментировал ваш пост', time: '1 час назад' },
    { id: 3, type: 'friend', user: 'Елена Козлова', content: 'добавила вас в друзья', time: '3 часа назад' },
    { id: 4, type: 'like', user: 'Мария Сидорова', content: 'понравился ваш комментарий', time: '5 часов назад' }
  ];

  const searchUsers: SearchUser[] = [
    { id: 10, name: 'Олег Кузнецов', avatar: 'ОК', mutualFriends: 5 },
    { id: 11, name: 'Ирина Морозова', avatar: 'ИМ', mutualFriends: 12 },
    { id: 12, name: 'Павел Лебедев', avatar: 'ПЛ', mutualFriends: 3 },
    { id: 13, name: 'Наталья Соколова', avatar: 'НС', mutualFriends: 8 }
  ];

  const userProfiles: UserProfile[] = [
    {
      id: 1,
      name: 'Анна Петрова',
      avatar: 'АП',
      bio: 'Фотограф и путешественник. Люблю природу и новые места.',
      location: 'Санкт-Петербург, Россия',
      work: 'Фрилансер',
      friends: 342,
      photos: 215,
      followers: 128,
      status: 'online',
      posts: [
        {
          id: 101,
          author: 'Анна Петрова',
          avatar: 'АП',
          content: 'Новая фотосессия на закате! 🌅',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          likes: 42,
          comments: [],
          time: '1 день назад'
        }
      ]
    },
    {
      id: 2,
      name: 'Дмитрий Иванов',
      avatar: 'ДИ',
      bio: 'Разработчик и предприниматель. Создаю инновационные продукты.',
      location: 'Москва, Россия',
      work: 'Tech Startup',
      friends: 567,
      photos: 89,
      followers: 234,
      status: 'online',
      posts: [
        {
          id: 201,
          author: 'Дмитрий Иванов',
          avatar: 'ДИ',
          content: 'Работа над новым проектом продолжается! 💻',
          likes: 67,
          comments: [],
          time: '3 часа назад'
        }
      ]
    },
    {
      id: 3,
      name: 'Мария Сидорова',
      avatar: 'МС',
      bio: 'Дизайнер интерфейсов. Создаю красивые и удобные решения.',
      location: 'Казань, Россия',
      work: 'Design Agency',
      friends: 189,
      photos: 156,
      followers: 95,
      status: 'offline',
      posts: []
    }
  ];

  const handleViewProfile = (userId: number) => {
    const profile = userProfiles.find(u => u.id === userId);
    if (profile) {
      setViewingProfile(profile);
    }
  };

  const handleSubscribe = (userId: number) => {
    setSubscribedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        toast({ title: 'Вы отписались' });
      } else {
        newSet.add(userId);
        toast({ title: 'Вы подписались на пользователя' });
      }
      return newSet;
    });
  };

  const handleOpenImage = (url: string) => {
    const format = url.split('.').pop()?.toLowerCase() || 'jpg';
    setViewingImage({ url, format });
    setImageViewMode('fit');
  };

  const getImageViewStyle = () => {
    switch (imageViewMode) {
      case 'fit':
        return 'object-contain max-h-[80vh]';
      case 'fill':
        return 'object-cover w-full h-[80vh]';
      case 'original':
        return 'object-none';
      default:
        return 'object-contain max-h-[80vh]';
    }
  };

  const navItems = [
    { id: 'feed' as View, icon: 'Home', label: 'Лента', color: 'bg-[#0078D7]' },
    { id: 'profile' as View, icon: 'User', label: 'Профиль', color: 'bg-[#00BCF2]' },
    { id: 'friends' as View, icon: 'Users', label: 'Друзья', color: 'bg-[#7FBA00]' },
    { id: 'messages' as View, icon: 'MessageSquare', label: 'Сообщения', color: 'bg-[#FFB900]' },
    { id: 'music' as View, icon: 'Music', label: 'Музыка', color: 'bg-[#9b87f5]' },
    { id: 'notifications' as View, icon: 'Bell', label: 'Уведомления', color: 'bg-[#E81123]' }
  ];

  const bgColor = isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const cardBg = isDarkMode ? 'bg-[#2D2D30]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-[#2D2D30]';
  const borderColor = isDarkMode ? 'border-[#3E3E42]' : 'border-gray-200';

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <Toaster />
        <Card className={`p-8 w-full max-w-md rounded-none border-2 ${borderColor} ${cardBg}`}>
          <div className="flex justify-center mb-6">
            <div className="bg-[#0078D7] p-4">
              <Icon name="Users" size={48} className="text-white" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold text-center mb-2 ${textColor}`}>МояСеть</h1>
          <p className="text-center text-gray-500 mb-6">Войдите или зарегистрируйтесь</p>
          
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div>
                <Label htmlFor="login-username">Логин</Label>
                <Input 
                  id="login-username" 
                  className="rounded-none border-2" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
              <div>
                <Label htmlFor="login-password">Пароль</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  className="rounded-none border-2" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
              </div>
              <Button onClick={handleAuth} className="w-full bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div>
                <Label htmlFor="reg-username">Логин</Label>
                <Input 
                  id="reg-username" 
                  className="rounded-none border-2" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Пароль</Label>
                <Input 
                  id="reg-password" 
                  type="password" 
                  className="rounded-none border-2" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleAuth} className="w-full bg-[#7FBA00] hover:bg-[#6a9e00] rounded-none">
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  const renderComments = (comments: Comment[], postId: number, depth = 0) => {
    return comments.map(comment => {
      const isLiked = likedComments.has(comment.id);
      const displayLikes = comment.likes + (isLiked ? 1 : 0);
      
      return (
        <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-3'}`}>
          <div className={`p-3 ${cardBg} border ${borderColor} rounded`}>
            <div className="flex gap-2 items-start">
              <Avatar className="h-8 w-8 rounded-none">
                <AvatarFallback className="bg-[#00BCF2] text-white rounded-none text-xs">
                  {comment.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-sm ${textColor}`}>{comment.author}</span>
                  <span className="text-xs text-gray-500">{comment.time}</span>
                </div>
                <p className={`text-sm ${textColor} mb-2`}>{renderTextWithLinks(comment.content)}</p>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLikeComment(comment.id)}
                    className={`h-6 px-2 gap-1 ${isLiked ? 'text-[#E81123]' : 'text-gray-500'} hover:text-[#E81123]`}
                  >
                    <Icon name="Heart" size={14} className={isLiked ? 'fill-current' : ''} />
                    <span className="text-xs">{displayLikes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReplyingTo({ postId, commentId: comment.id, author: comment.author })}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-[#0078D7]"
                  >
                    Ответить
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {comment.replies.length > 0 && renderComments(comment.replies, postId, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className={`h-screen flex overflow-hidden ${bgColor}`}>
      <Toaster />
      
      <aside className="w-64 bg-[#2D2D30] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 mb-4 p-4 bg-[#0078D7]">
          <Avatar className="h-12 w-12 rounded-none">
            <AvatarFallback className="bg-white text-[#0078D7] rounded-none font-bold">{currentUser.avatar}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <div className="font-semibold">{currentUser.name}</div>
            <div className="text-xs opacity-80">В сети</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-white text-sm">Тёмная тема</span>
          <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`${item.color} ${
              currentView === item.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2D2D30]' : ''
            } text-white p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95`}
          >
            <Icon name={item.icon} size={24} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/10 mt-auto rounded-none">
          <Icon name="LogOut" size={20} className="mr-2" />
          Выход
        </Button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#0078D7] text-white p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">МояСеть</h1>
          <div className="flex items-center gap-2 relative">
            <Input 
              placeholder="Поиск..." 
              className="w-80 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-none"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-none"
              onClick={() => setGlobalSearchQuery('')}
            >
              {globalSearchQuery ? <Icon name="X" size={20} /> : <Icon name="Search" size={20} />}
            </Button>
            
            {filteredSearchResults.length > 0 && (
              <div className={`absolute top-full right-0 mt-2 w-96 ${cardBg} border-2 ${borderColor} rounded-none shadow-xl z-50 max-h-96 overflow-y-auto`}>
                {filteredSearchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      handleViewProfile(user.id);
                      setGlobalSearchQuery('');
                    }}
                    className={`w-full p-4 flex items-center gap-3 border-b ${borderColor} hover:bg-[#0078D7]/10 transition-colors text-left`}
                  >
                    <Avatar className="h-12 w-12 rounded-none">
                      <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className={`font-semibold ${textColor}`}>{user.name}</div>
                      <div className="text-sm text-gray-500">{user.work}</div>
                    </div>
                    {user.status === 'online' && (
                      <Badge className="bg-[#7FBA00] rounded-none text-xs">В сети</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {currentView === 'feed' && (
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <Card className={`p-6 rounded-none border-2 ${borderColor} ${cardBg}`}>
                  <div className="flex gap-3">
                    <Avatar className="h-12 w-12 rounded-none">
                      <AvatarFallback className="bg-[#0078D7] text-white rounded-none">{currentUser.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea 
                        placeholder="Что у вас нового?" 
                        className="resize-none rounded-none border-2"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handlePublishPost} className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                          <Icon name="Send" size={16} className="mr-2" />
                          Опубликовать
                        </Button>
                        <Button variant="outline" className="rounded-none border-2" onClick={() => document.getElementById('post-photo')?.click()}>
                          <Icon name="Image" size={16} className="mr-2" />
                          Фото
                        </Button>
                        <Button variant="outline" className="rounded-none border-2" onClick={() => document.getElementById('post-video')?.click()}>
                          <Icon name="Video" size={16} className="mr-2" />
                          Видео
                        </Button>
                        <input type="file" id="post-photo" accept="image/*" className="hidden" onChange={handleMediaUpload} />
                        <input type="file" id="post-video" accept="video/*" className="hidden" onChange={handleMediaUpload} />
                      </div>
                      {mediaFile && (
                        <div className="flex items-center gap-2 p-2 bg-[#0078D7]/10 rounded">
                          <Icon name="File" size={16} className="text-[#0078D7]" />
                          <span className="text-sm">{mediaFile.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => setMediaFile(null)}>
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {posts.map((post) => {
                  const isPostLiked = likedPosts.has(post.id);
                  const displayPostLikes = post.likes + (isPostLiked ? 1 : 0);
                  const postAuthorProfile = userProfiles.find(u => u.name === post.author);
                  
                  return (
                    <Card key={post.id} className={`p-6 rounded-none border-2 ${borderColor} ${cardBg}`}>
                      {post.isRepost && (
                        <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm">
                          <Icon name="Repeat2" size={16} />
                          <span>{post.author} поделился постом</span>
                        </div>
                      )}
                      <div className="flex gap-3 mb-4">
                        <Avatar 
                          className="h-12 w-12 rounded-none cursor-pointer hover:opacity-80 transition-opacity" 
                          onClick={() => postAuthorProfile && handleViewProfile(postAuthorProfile.id)}
                        >
                          <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                            {post.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div 
                            className={`font-semibold ${textColor} cursor-pointer hover:text-[#0078D7] transition-colors`}
                            onClick={() => postAuthorProfile && handleViewProfile(postAuthorProfile.id)}
                          >
                            {post.isRepost && post.originalAuthor ? post.originalAuthor : post.author}
                          </div>
                          <div className="text-sm text-gray-500">{post.time}</div>
                        </div>
                      </div>
                      <p className={`mb-4 ${textColor}`}>{renderTextWithLinks(post.content)}</p>
                      
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full mb-4 border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => handleOpenImage(post.image!)}
                        />
                      )}
                      
                      {post.video && (
                        <div className="mb-4">
                          <div className="flex justify-end mb-2">
                            <Select value={videoQuality} onValueChange={setVideoQuality}>
                              <SelectTrigger className="w-32 h-8 text-xs rounded-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="360p">360p</SelectItem>
                                <SelectItem value="720p">720p</SelectItem>
                                <SelectItem value="1080p">1080p</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <video controls className="w-full border-2 border-gray-200">
                            <source src={post.video} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      
                      <div className={`flex gap-6 pt-4 border-t-2 ${borderColor}`}>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleLikePost(post.id)}
                          className={`gap-2 ${isPostLiked ? 'text-[#E81123]' : 'text-[#0078D7]'} hover:bg-[#0078D7]/10 rounded-none`}
                        >
                          <Icon name="Heart" size={18} className={isPostLiked ? 'fill-current' : ''} />
                          <span className="font-semibold">{displayPostLikes}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => toggleComments(post.id)}
                          className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none"
                        >
                          <Icon name="MessageCircle" size={18} />
                          <span className="font-semibold">{post.comments.length}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleSharePost(post)}
                          className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none"
                        >
                          <Icon name="Share2" size={18} />
                          <span className="font-semibold">{post.shares || 0}</span>
                        </Button>
                      </div>

                      {expandedComments[post.id] && (
                        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                          {!replyingTo && (
                            <div className="flex gap-2 mb-4">
                              <Avatar className="h-8 w-8 rounded-none">
                                <AvatarFallback className="bg-[#0078D7] text-white rounded-none text-xs">
                                  {currentUser.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Написать комментарий..."
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                  className="rounded-none border-2"
                                />
                                <Button 
                                  onClick={() => handleAddComment(post.id)}
                                  size="sm" 
                                  className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none"
                                >
                                  <Icon name="Send" size={16} />
                                </Button>
                              </div>
                            </div>
                          )}

                          {replyingTo && replyingTo.postId === post.id && (
                            <div className="flex gap-2 mb-4 bg-[#0078D7]/5 p-3 rounded">
                              <Avatar className="h-8 w-8 rounded-none">
                                <AvatarFallback className="bg-[#0078D7] text-white rounded-none text-xs">
                                  {currentUser.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Ответ для <span className="font-semibold text-[#0078D7]">{replyingTo.author}</span></span>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setReplyingTo(null)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Icon name="X" size={14} />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder={`Ответить ${replyingTo.author}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReplyToComment(post.id, replyingTo.commentId)}
                                    className="rounded-none border-2"
                                    autoFocus
                                  />
                                  <Button 
                                    onClick={() => handleReplyToComment(post.id, replyingTo.commentId)}
                                    size="sm" 
                                    className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none"
                                  >
                                    <Icon name="Send" size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {post.comments.length > 0 && (
                            <div className="space-y-2">
                              {renderComments(post.comments, post.id)}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {currentView === 'music' && (
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1">
                <div className="max-w-5xl mx-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${textColor}`}>Моя музыка</h2>
                    <Button onClick={() => setIsAddMusicOpen(true)} className="bg-[#9b87f5] hover:bg-[#8b77e5] rounded-none">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить трек
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {tracks.map((track) => (
                      <Card 
                        key={track.id} 
                        className={`p-0 rounded-none border-2 ${borderColor} overflow-hidden cursor-pointer hover:scale-105 transition-transform ${cardBg}`}
                        onClick={() => playTrack(track)}
                      >
                        <div className="relative">
                          <img src={track.cover} alt={track.title} className="w-full h-48 object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-[#9b87f5] p-4">
                              <Icon name="Play" size={32} className="text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className={`font-semibold ${textColor} truncate`}>{track.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400">{track.duration}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Icon name="MoreVertical" size={14} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {currentTrack && (
                <div className={`${cardBg} border-t-2 ${borderColor} p-4`}>
                  <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-16 h-16 rounded-none" />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${textColor}`}>{currentTrack.title}</h4>
                      <p className="text-sm text-gray-500">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="rounded-none">
                        <Icon name="SkipBack" size={20} />
                      </Button>
                      <Button 
                        onClick={togglePlay}
                        className="bg-[#9b87f5] hover:bg-[#8b77e5] rounded-none h-12 w-12"
                      >
                        <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} className="text-white" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-none">
                        <Icon name="SkipForward" size={20} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 w-32">
                      <Icon name="Volume2" size={18} className="text-gray-500" />
                      <Slider 
                        value={volume} 
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'profile' && (
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto p-6">
                <Card className={`rounded-none border-2 ${borderColor} overflow-hidden ${cardBg}`}>
                  <div className="h-48 bg-gradient-to-r from-[#0078D7] to-[#00BCF2]"></div>
                  <div className="p-6">
                    <div className="flex gap-6 -mt-20 mb-6">
                      <Avatar className="h-32 w-32 rounded-none border-4 border-white">
                        <AvatarFallback className="bg-[#0078D7] text-white rounded-none text-4xl font-bold">
                          {currentUser.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-16 flex-1">
                        <h2 className={`text-3xl font-bold mb-1 ${textColor}`}>{profileEdit.name}</h2>
                        <p className="text-gray-600 mb-4">{profileEdit.work}</p>
                        <div className="flex gap-2">
                          <Button onClick={() => setIsEditProfileOpen(true)} className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                            Редактировать профиль
                          </Button>
                          <Button onClick={() => setIsSettingsOpen(true)} variant="outline" className="rounded-none border-2">
                            <Icon name="Settings" size={16} className="mr-2" />
                            Настройки
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <Card className="p-4 rounded-none border-2 bg-[#0078D7] text-white">
                        <div className="text-3xl font-bold">256</div>
                        <div className="text-sm opacity-90">Друзей</div>
                      </Card>
                      <Card className="p-4 rounded-none border-2 bg-[#7FBA00] text-white">
                        <div className="text-3xl font-bold">128</div>
                        <div className="text-sm opacity-90">Фотографий</div>
                      </Card>
                      <Card className="p-4 rounded-none border-2 bg-[#FFB900] text-white">
                        <div className="text-3xl font-bold">42</div>
                        <div className="text-sm opacity-90">Подписчиков</div>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className={`font-bold mb-2 text-lg ${textColor}`}>О себе</h3>
                        <p className="text-gray-700">{profileEdit.bio}</p>
                      </div>
                      <div>
                        <h3 className={`font-bold mb-2 text-lg ${textColor}`}>Информация</h3>
                        <div className="space-y-2 text-gray-700">
                          <div className="flex gap-2">
                            <Icon name="MapPin" size={18} className="text-[#0078D7]" />
                            <span>{profileEdit.location}</span>
                          </div>
                          <div className="flex gap-2">
                            <Icon name="Briefcase" size={18} className="text-[#0078D7]" />
                            <span>{profileEdit.work}</span>
                          </div>
                          <div className="flex gap-2">
                            <Icon name="Calendar" size={18} className="text-[#0078D7]" />
                            <span>Регистрация: Январь 2020</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          )}

          {currentView === 'friends' && (
            <ScrollArea className="h-full">
              <div className="max-w-5xl mx-auto p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-2xl font-bold ${textColor}`}>Мои друзья ({friendsList.length})</h2>
                    <Button onClick={() => setIsFindFriendsOpen(true)} className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Найти друзей
                    </Button>
                  </div>
                  <Input 
                    placeholder="Поиск среди друзей..." 
                    className="rounded-none border-2 mb-4"
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                  />
                </div>
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Users" size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-500 text-lg">
                      {friendSearchQuery ? 'Друзья не найдены' : 'У вас пока нет друзей'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredFriends.map((friend) => {
                      const friendProfile = userProfiles.find(u => u.name === friend.name);
                      return (
                      <Card key={friend.id} className={`p-6 rounded-none border-2 ${borderColor} ${cardBg}`}>
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            <Avatar 
                              className="h-24 w-24 rounded-none cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => friendProfile && handleViewProfile(friendProfile.id)}
                            >
                              <AvatarFallback className="bg-[#00BCF2] text-white rounded-none text-2xl font-bold">
                                {friend.avatar}
                              </AvatarFallback>
                            </Avatar>
                            {friend.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#7FBA00] border-2 border-white"></div>
                            )}
                          </div>
                          <h3 
                            className={`font-semibold mb-2 ${textColor} truncate w-full cursor-pointer hover:text-[#0078D7] transition-colors`}
                            onClick={() => friendProfile && handleViewProfile(friendProfile.id)}
                          >{friend.name}</h3>
                          <Badge className={`${friend.status === 'online' ? 'bg-[#7FBA00]' : 'bg-gray-400'} rounded-none`}>
                            {friend.status === 'online' ? 'В сети' : 'Не в сети'}
                          </Badge>
                          <div className="flex gap-2 mt-4 w-full">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 rounded-none border-2"
                              onClick={() => {
                                setCurrentView('messages');
                                setSelectedChat(friend.id);
                              }}
                            >
                              <Icon name="MessageSquare" size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 rounded-none border-2 text-[#E81123] hover:text-[#E81123] hover:bg-[#E81123]/10"
                              onClick={() => handleRemoveFriend(friend.id)}
                            >
                              <Icon name="UserMinus" size={14} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {currentView === 'messages' && (
            <div className="flex h-full">
              <div className={`w-80 border-r-2 ${borderColor} ${isDarkMode ? 'bg-[#252526]' : 'bg-gray-50'}`}>
                <div className={`p-4 border-b-2 ${borderColor}`}>
                  <Input placeholder="Поиск сообщений..." className="rounded-none border-2" />
                </div>
                <ScrollArea className="h-[calc(100%-73px)]">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      className={`w-full p-4 flex gap-3 border-b-2 ${borderColor} hover:bg-white/5 transition-colors ${
                        selectedChat === conv.id ? `${cardBg} border-l-4 border-l-[#0078D7]` : ''
                      }`}
                    >
                      <Avatar className="h-12 w-12 rounded-none">
                        <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-semibold ${textColor}`}>{conv.name}</span>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="bg-[#E81123] rounded-none h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                    </button>
                  ))}
                </ScrollArea>
              </div>

              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className={`p-4 border-b-2 ${borderColor} ${cardBg} flex items-center gap-3`}>
                      <Avatar className="h-10 w-10 rounded-none">
                        <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                          {conversations.find((c) => c.id === selectedChat)?.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className={`font-semibold ${textColor}`}>
                          {conversations.find((c) => c.id === selectedChat)?.name}
                        </div>
                        <div className="text-sm text-[#7FBA00]">В сети</div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-none">
                        <Icon name="Phone" size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-none">
                        <Icon name="Video" size={20} />
                      </Button>
                    </div>

                    <ScrollArea className={`flex-1 p-6 ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-gray-50'}`}>
                      <div className="space-y-4">
                        {conversations.find((c) => c.id === selectedChat)?.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md ${msg.senderId === 0 ? 'bg-[#0078D7] text-white' : `${cardBg} border-2 ${borderColor}`} p-3`}>
                              {msg.media && (
                                <div className="mb-2">
                                  {msg.mediaType === 'image' ? (
                                    <img 
                                      src={msg.media} 
                                      alt="Attachment" 
                                      className="max-w-full cursor-pointer hover:opacity-90 transition-opacity" 
                                      onClick={() => handleOpenImage(msg.media!)}
                                    />
                                  ) : msg.mediaType === 'video' ? (
                                    <video controls className="max-w-full">
                                      <source src={msg.media} />
                                    </video>
                                  ) : null}
                                </div>
                              )}
                              {msg.text && <p className={msg.senderId === 0 ? 'text-white' : textColor}>{renderTextWithLinks(msg.text)}</p>}
                              <span className={`text-xs ${msg.senderId === 0 ? 'opacity-70' : 'text-gray-500'}`}>{msg.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className={`p-4 border-t-2 ${borderColor} ${cardBg}`}>
                      <div className="flex gap-2 mb-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-none" 
                          onClick={() => document.getElementById('msg-file')?.click()}
                        >
                          <Icon name="Paperclip" size={20} />
                        </Button>
                        <Input 
                          placeholder="Напишите сообщение..." 
                          className="flex-1 rounded-none border-2" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                          <Icon name="Send" size={20} />
                        </Button>
                        <input 
                          type="file" 
                          id="msg-file" 
                          accept="image/*,video/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setMessageMediaFile(e.target.files[0]);
                              toast({ title: `Файл загружен: ${e.target.files[0].name}` });
                            }
                          }} 
                        />
                      </div>
                      {messageMediaFile && (
                        <div className="flex items-center gap-2 p-2 bg-[#0078D7]/10 rounded">
                          <Icon name="File" size={16} className="text-[#0078D7]" />
                          <span className="text-sm">{messageMediaFile.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => setMessageMediaFile(null)}>
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Icon name="MessageSquare" size={64} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Выберите диалог для начала общения</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'notifications' && (
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto p-6">
                <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>Уведомления</h2>
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <Card key={notif.id} className={`p-4 rounded-none border-2 ${borderColor} hover:bg-gray-50/5 transition-colors ${cardBg}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${
                          notif.type === 'like' ? 'bg-[#E81123]' : 
                          notif.type === 'comment' ? 'bg-[#0078D7]' : 
                          'bg-[#7FBA00]'
                        }`}>
                          <Icon 
                            name={notif.type === 'like' ? 'Heart' : notif.type === 'comment' ? 'MessageCircle' : 'UserPlus'} 
                            size={20} 
                            className="text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <p className={textColor}>
                            <span className="font-semibold">{notif.user}</span> {notif.content}
                          </p>
                          <span className="text-sm text-gray-500">{notif.time}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </main>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle>Редактирование профиля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Имя</Label>
              <Input 
                id="edit-name" 
                value={profileEdit.name} 
                onChange={(e) => setProfileEdit({ ...profileEdit, name: e.target.value })}
                className="rounded-none border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">О себе</Label>
              <Textarea 
                id="edit-bio" 
                value={profileEdit.bio} 
                onChange={(e) => setProfileEdit({ ...profileEdit, bio: e.target.value })}
                className="rounded-none border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Город</Label>
              <Input 
                id="edit-location" 
                value={profileEdit.location} 
                onChange={(e) => setProfileEdit({ ...profileEdit, location: e.target.value })}
                className="rounded-none border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-work">Место работы</Label>
              <Input 
                id="edit-work" 
                value={profileEdit.work} 
                onChange={(e) => setProfileEdit({ ...profileEdit, work: e.target.value })}
                className="rounded-none border-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} className="rounded-none">
              Отмена
            </Button>
            <Button onClick={handleSaveProfile} className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFindFriendsOpen} onOpenChange={setIsFindFriendsOpen}>
        <DialogContent className="rounded-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>Найти друзей</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Input 
              placeholder="Поиск людей..." 
              className="rounded-none border-2"
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {(friendSearchQuery.trim() 
                ? allUsers.filter(u => u.name.toLowerCase().includes(friendSearchQuery.toLowerCase()))
                : searchUsers.map(u => allUsers.find(au => au.id === u.id)!).filter(Boolean)
              ).map((user) => (
                <Card key={user.id} className="p-4 rounded-none border-2 flex items-center gap-4 cursor-pointer hover:bg-[#0078D7]/5 transition-colors">
                  <Avatar 
                    className="h-16 w-16 rounded-none"
                    onClick={() => {
                      handleViewProfile(user.id);
                      setIsFindFriendsOpen(false);
                      setFriendSearchQuery('');
                    }}
                  >
                    <AvatarFallback className="bg-[#00BCF2] text-white rounded-none text-xl font-bold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="flex-1"
                    onClick={() => {
                      handleViewProfile(user.id);
                      setIsFindFriendsOpen(false);
                      setFriendSearchQuery('');
                    }}
                  >
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.work}</p>
                  </div>
                  <Button 
                    onClick={() => {
                      handleSubscribe(user.id);
                    }} 
                    className={`${subscribedUsers.has(user.id) ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#7FBA00] hover:bg-[#6a9e00]'} rounded-none`}
                  >
                    <Icon name={subscribedUsers.has(user.id) ? 'UserCheck' : 'UserPlus'} size={16} className="mr-2" />
                    {subscribedUsers.has(user.id) ? 'Подписан' : 'Подписаться'}
                  </Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMusicOpen} onOpenChange={setIsAddMusicOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle>Добавить музыку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="track-title">Название трека</Label>
              <Input id="track-title" placeholder="Введите название..." className="rounded-none border-2" />
            </div>
            <div>
              <Label htmlFor="track-artist">Исполнитель</Label>
              <Input id="track-artist" placeholder="Введите имя исполнителя..." className="rounded-none border-2" />
            </div>
            <div>
              <Label htmlFor="track-file">Аудиофайл</Label>
              <Input id="track-file" type="file" accept="audio/*" className="rounded-none border-2" />
            </div>
            <div>
              <Label htmlFor="track-cover">Обложка</Label>
              <Input id="track-cover" type="file" accept="image/*" className="rounded-none border-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMusicOpen(false)} className="rounded-none">
              Отмена
            </Button>
            <Button onClick={() => { setIsAddMusicOpen(false); toast({ title: 'Трек добавлен в библиотеку' }); }} className="bg-[#9b87f5] hover:bg-[#8b77e5] rounded-none">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="rounded-none max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Settings" size={24} />
              Настройки
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="privacy">Приватность</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              <TabsTrigger value="interface">Интерфейс</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacy" className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Eye" size={18} className="text-[#0078D7]" />
                  Видимость профиля
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Кто может видеть мой профиль</Label>
                      <p className="text-sm text-gray-500">Управление доступом к вашей странице</p>
                    </div>
                    <Select 
                      value={settings.privacy.profileVisibility}
                      onValueChange={(v) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: v }
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Все</SelectItem>
                        <SelectItem value="friends">Друзья</SelectItem>
                        <SelectItem value="only-me">Только я</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Кто может видеть мои посты</Label>
                      <p className="text-sm text-gray-500">Контроль видимости публикаций</p>
                    </div>
                    <Select 
                      value={settings.privacy.postsVisibility}
                      onValueChange={(v) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, postsVisibility: v }
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Все</SelectItem>
                        <SelectItem value="friends">Друзья</SelectItem>
                        <SelectItem value="only-me">Только я</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Кто может видеть моих друзей</Label>
                      <p className="text-sm text-gray-500">Кто увидит ваш список друзей</p>
                    </div>
                    <Select 
                      value={settings.privacy.friendsVisibility}
                      onValueChange={(v) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, friendsVisibility: v }
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Все</SelectItem>
                        <SelectItem value="friends">Друзья</SelectItem>
                        <SelectItem value="only-me">Только я</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Bell" size={18} className="text-[#0078D7]" />
                  Управление уведомлениями
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E81123]/10">
                        <Icon name="Heart" size={20} className="text-[#E81123]" />
                      </div>
                      <div>
                        <Label>Лайки</Label>
                        <p className="text-sm text-gray-500">Уведомления о новых лайках</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.likes}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, likes: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0078D7]/10">
                        <Icon name="MessageCircle" size={20} className="text-[#0078D7]" />
                      </div>
                      <div>
                        <Label>Комментарии</Label>
                        <p className="text-sm text-gray-500">Уведомления о комментариях</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.comments}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, comments: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#7FBA00]/10">
                        <Icon name="UserPlus" size={20} className="text-[#7FBA00]" />
                      </div>
                      <div>
                        <Label>Заявки в друзья</Label>
                        <p className="text-sm text-gray-500">Уведомления о новых заявках</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.friendRequests}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, friendRequests: checked }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FFB900]/10">
                        <Icon name="Mail" size={20} className="text-[#FFB900]" />
                      </div>
                      <div>
                        <Label>Сообщения</Label>
                        <p className="text-sm text-gray-500">Уведомления о новых сообщениях</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications.messages}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, messages: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="interface" className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Monitor" size={18} className="text-[#0078D7]" />
                  Настройки интерфейса
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Язык интерфейса</Label>
                      <p className="text-sm text-gray-500">Выберите предпочитаемый язык</p>
                    </div>
                    <Select 
                      value={settings.interface.language}
                      onValueChange={(v) => setSettings({
                        ...settings,
                        interface: { ...settings.interface, language: v }
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">Русский</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="uk">Українська</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Размер шрифта</Label>
                      <p className="text-sm text-gray-500">Комфортный размер текста</p>
                    </div>
                    <Select 
                      value={settings.interface.fontSize}
                      onValueChange={(v) => setSettings({
                        ...settings,
                        interface: { ...settings.interface, fontSize: v }
                      })}
                    >
                      <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Маленький</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="large">Большой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-2 rounded">
                    <div>
                      <Label>Тёмная тема</Label>
                      <p className="text-sm text-gray-500">Тёмное оформление интерфейса</p>
                    </div>
                    <Switch 
                      checked={isDarkMode}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Shield" size={18} className="text-[#0078D7]" />
                  Безопасность аккаунта
                </h3>
                <div className="space-y-4">
                  <Card className="p-4 rounded-none border-2">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label>Двухфакторная аутентификация</Label>
                        <p className="text-sm text-gray-500">Дополнительная защита входа</p>
                      </div>
                      <Switch 
                        checked={settings.security.twoFactor}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            security: { ...settings.security, twoFactor: checked }
                          });
                          toast({ title: checked ? '2FA включена' : '2FA выключена' });
                        }}
                      />
                    </div>
                    {settings.security.twoFactor && (
                      <div className="mt-3 p-3 bg-[#7FBA00]/10 rounded flex items-center gap-2 text-sm">
                        <Icon name="CheckCircle" size={16} className="text-[#7FBA00]" />
                        <span>Ваш аккаунт защищён двухфакторной аутентификацией</span>
                      </div>
                    )}
                  </Card>
                  
                  <Card className="p-4 rounded-none border-2">
                    <Label className="mb-3 block">Смена пароля</Label>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Текущий пароль" className="rounded-none border-2" />
                      <Input type="password" placeholder="Новый пароль" className="rounded-none border-2" />
                      <Input type="password" placeholder="Повторите новый пароль" className="rounded-none border-2" />
                      <Button className="w-full bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                        <Icon name="Lock" size={16} className="mr-2" />
                        Изменить пароль
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4 rounded-none border-2 border-[#E81123]/30 bg-[#E81123]/5">
                    <Label className="mb-3 block text-[#E81123]">Опасная зона</Label>
                    <p className="text-sm text-gray-600 mb-3">Действие нельзя будет отменить</p>
                    <Button variant="outline" className="w-full border-[#E81123] text-[#E81123] hover:bg-[#E81123] hover:text-white rounded-none">
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Удалить аккаунт
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="rounded-none">
              Закрыть
            </Button>
            <Button 
              onClick={() => {
                setIsSettingsOpen(false);
                toast({ title: 'Настройки сохранены' });
              }} 
              className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none"
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="rounded-none max-w-5xl max-h-[90vh] overflow-y-auto">
          {viewingProfile && (
            <>
              <div className="h-48 bg-gradient-to-r from-[#0078D7] to-[#00BCF2] -m-6 mb-0"></div>
              <div className="p-6 pt-0">
                <div className="flex gap-6 -mt-20 mb-6">
                  <Avatar className="h-32 w-32 rounded-none border-4 border-white">
                    <AvatarFallback className="bg-[#0078D7] text-white rounded-none text-4xl font-bold">
                      {viewingProfile.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-16 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className={`text-3xl font-bold mb-1 ${textColor}`}>{viewingProfile.name}</h2>
                        <p className="text-gray-600 mb-2">{viewingProfile.work}</p>
                        {viewingProfile.status === 'online' && (
                          <Badge className="bg-[#7FBA00] rounded-none">В сети</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSubscribe(viewingProfile.id)}
                          className={`${subscribedUsers.has(viewingProfile.id) ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#0078D7] hover:bg-[#005a9e]'} rounded-none`}
                        >
                          <Icon name={subscribedUsers.has(viewingProfile.id) ? 'UserCheck' : 'UserPlus'} size={16} className="mr-2" />
                          {subscribedUsers.has(viewingProfile.id) ? 'Отписаться' : 'Подписаться'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="rounded-none border-2"
                          onClick={() => {
                            setViewingProfile(null);
                            setCurrentView('messages');
                          }}
                        >
                          <Icon name="MessageSquare" size={16} className="mr-2" />
                          Написать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 rounded-none border-2 bg-[#0078D7] text-white">
                    <div className="text-3xl font-bold">{viewingProfile.friends}</div>
                    <div className="text-sm opacity-90">Друзей</div>
                  </Card>
                  <Card className="p-4 rounded-none border-2 bg-[#7FBA00] text-white">
                    <div className="text-3xl font-bold">{viewingProfile.photos}</div>
                    <div className="text-sm opacity-90">Фотографий</div>
                  </Card>
                  <Card className="p-4 rounded-none border-2 bg-[#FFB900] text-white">
                    <div className="text-3xl font-bold">{viewingProfile.followers + (subscribedUsers.has(viewingProfile.id) ? 1 : 0)}</div>
                    <div className="text-sm opacity-90">Подписчиков</div>
                  </Card>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className={`font-bold mb-2 text-lg ${textColor}`}>О себе</h3>
                    <p className="text-gray-700">{viewingProfile.bio}</p>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-2 text-lg ${textColor}`}>Информация</h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex gap-2">
                        <Icon name="MapPin" size={18} className="text-[#0078D7]" />
                        <span>{viewingProfile.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <Icon name="Briefcase" size={18} className="text-[#0078D7]" />
                        <span>{viewingProfile.work}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {viewingProfile.posts.length > 0 && (
                  <div>
                    <h3 className={`font-bold mb-4 text-lg ${textColor}`}>Посты</h3>
                    <div className="space-y-4">
                      {viewingProfile.posts.map((post) => (
                        <Card key={post.id} className={`p-6 rounded-none border-2 ${borderColor} ${cardBg}`}>
                          <div className="flex gap-3 mb-4">
                            <Avatar className="h-12 w-12 rounded-none">
                              <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                                {post.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className={`font-semibold ${textColor}`}>{post.author}</div>
                              <div className="text-sm text-gray-500">{post.time}</div>
                            </div>
                          </div>
                          <p className={`mb-4 ${textColor}`}>{renderTextWithLinks(post.content)}</p>
                          {post.image && (
                            <img 
                              src={post.image} 
                              alt="Post" 
                              className="w-full mb-4 border-2 border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => handleOpenImage(post.image!)}
                            />
                          )}
                          <div className={`flex gap-6 pt-4 border-t-2 ${borderColor}`}>
                            <Button variant="ghost" className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none">
                              <Icon name="Heart" size={18} />
                              <span className="font-semibold">{post.likes}</span>
                            </Button>
                            <Button variant="ghost" className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none">
                              <Icon name="MessageCircle" size={18} />
                              <span className="font-semibold">{post.comments.length}</span>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="rounded-none max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          {viewingImage && (
            <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#1E1E1E]' : 'bg-black'}`}>
              <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-[#2D2D30]' : 'bg-gray-900'} border-b-2 ${borderColor}`}>
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#0078D7] rounded-none uppercase">
                    {viewingImage.format}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={imageViewMode === 'fit' ? 'default' : 'outline'}
                      onClick={() => setImageViewMode('fit')}
                      className="rounded-none"
                    >
                      <Icon name="Minimize2" size={14} className="mr-1" />
                      Вписать
                    </Button>
                    <Button
                      size="sm"
                      variant={imageViewMode === 'fill' ? 'default' : 'outline'}
                      onClick={() => setImageViewMode('fill')}
                      className="rounded-none"
                    >
                      <Icon name="Maximize2" size={14} className="mr-1" />
                      Заполнить
                    </Button>
                    <Button
                      size="sm"
                      variant={imageViewMode === 'original' ? 'default' : 'outline'}
                      onClick={() => setImageViewMode('original')}
                      className="rounded-none"
                    >
                      <Icon name="Image" size={14} className="mr-1" />
                      Оригинал
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingImage.url;
                      link.download = `photo.${viewingImage.format}`;
                      link.click();
                      toast({ title: 'Фото загружается' });
                    }}
                    className="rounded-none text-white border-white hover:bg-white/10"
                  >
                    <Icon name="Download" size={14} className="mr-1" />
                    Скачать
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingImage(null)}
                    className="rounded-none text-white hover:bg-white/10"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center overflow-auto p-4">
                <img
                  src={viewingImage.url}
                  alt="Просмотр фото"
                  className={getImageViewStyle()}
                  style={imageViewMode === 'original' ? { maxWidth: 'none' } : {}}
                />
              </div>

              <div className={`p-3 ${isDarkMode ? 'bg-[#2D2D30]' : 'bg-gray-900'} border-t-2 ${borderColor}`}>
                <div className="flex items-center justify-center gap-6 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="ZoomIn" size={16} className="text-[#0078D7]" />
                    <span>Прокрутите для увеличения</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Move" size={16} className="text-[#7FBA00]" />
                    <span>Перетаскивание для перемещения</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;