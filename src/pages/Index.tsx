import { useState, useEffect } from 'react';
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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

type View = 'feed' | 'profile' | 'friends' | 'messages' | 'notifications';

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  time: string;
}

interface Friend {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface Message {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
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

const Index = () => {
  const { toast } = useToast();
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
  const [newMessage, setNewMessage] = useState('');
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [profileEdit, setProfileEdit] = useState({ 
    name: 'Вася Иванов', 
    bio: 'Люблю создавать красивые и функциональные веб-приложения. В свободное время увлекаюсь фотографией и путешествиями.', 
    location: 'Москва, Россия', 
    work: 'IT Company' 
  });

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
    if (newMessage.trim() || mediaFile) {
      toast({ title: 'Сообщение отправлено' });
      setNewMessage('');
      setMediaFile(null);
    }
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

  const posts: Post[] = [
    {
      id: 1,
      author: 'Анна Петрова',
      avatar: 'АП',
      content: 'Отличная погода сегодня! Провела весь день в парке 🌳',
      image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
      likes: 24,
      comments: 5,
      time: '2 часа назад'
    },
    {
      id: 2,
      author: 'Дмитрий Иванов',
      avatar: 'ДИ',
      content: 'Запустил новый проект! Долго работал над этим, наконец-то готово 🚀',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4',
      likes: 56,
      comments: 12,
      time: '4 часа назад'
    },
    {
      id: 3,
      author: 'Мария Сидорова',
      avatar: 'МС',
      content: 'Кто-нибудь знает хорошее кафе в центре? Нужно встретиться с клиентом',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      likes: 8,
      comments: 15,
      time: '5 часов назад'
    }
  ];

  const friends: Friend[] = [
    { id: 1, name: 'Анна Петрова', avatar: 'АП', status: 'online' },
    { id: 2, name: 'Дмитрий Иванов', avatar: 'ДИ', status: 'online' },
    { id: 3, name: 'Мария Сидорова', avatar: 'МС', status: 'offline' },
    { id: 4, name: 'Алексей Смирнов', avatar: 'АС', status: 'offline' },
    { id: 5, name: 'Елена Козлова', avatar: 'ЕК', status: 'online' },
    { id: 6, name: 'Сергей Волков', avatar: 'СВ', status: 'offline' }
  ];

  const messages: Message[] = [
    { id: 1, name: 'Анна Петрова', avatar: 'АП', lastMessage: 'Привет! Как дела?', time: '10:24', unread: 2 },
    { id: 2, name: 'Дмитрий Иванов', avatar: 'ДИ', lastMessage: 'Увидимся завтра', time: '09:15', unread: 0 },
    { id: 3, name: 'Мария Сидорова', avatar: 'МС', lastMessage: 'Спасибо за помощь!', time: 'Вчера', unread: 1 }
  ];

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

  const navItems = [
    { id: 'feed' as View, icon: 'Home', label: 'Лента', color: 'bg-[#0078D7]' },
    { id: 'profile' as View, icon: 'User', label: 'Профиль', color: 'bg-[#00BCF2]' },
    { id: 'friends' as View, icon: 'Users', label: 'Друзья', color: 'bg-[#7FBA00]' },
    { id: 'messages' as View, icon: 'MessageSquare', label: 'Сообщения', color: 'bg-[#FFB900]' },
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
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Поиск..." 
              className="w-80 bg-white/20 border-0 text-white placeholder:text-white/60 rounded-none"
            />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-none">
              <Icon name="Search" size={20} />
            </Button>
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

                {posts.map((post) => (
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
                    <p className={`mb-4 ${textColor}`}>{post.content}</p>
                    
                    {post.image && (
                      <img src={post.image} alt="Post" className="w-full mb-4 border-2 border-gray-200" />
                    )}
                    
                    {post.video && (
                      <video controls className="w-full mb-4 border-2 border-gray-200">
                        <source src={post.video} type="video/mp4" />
                      </video>
                    )}
                    
                    <div className={`flex gap-6 pt-4 border-t-2 ${borderColor}`}>
                      <Button variant="ghost" className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none">
                        <Icon name="Heart" size={18} />
                        <span className="font-semibold">{post.likes}</span>
                      </Button>
                      <Button variant="ghost" className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none">
                        <Icon name="MessageCircle" size={18} />
                        <span className="font-semibold">{post.comments}</span>
                      </Button>
                      <Button variant="ghost" className="gap-2 text-[#0078D7] hover:bg-[#0078D7]/10 rounded-none">
                        <Icon name="Share2" size={18} />
                        Поделиться
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
                          <Button variant="outline" className="rounded-none border-2">
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
                  <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Мои друзья</h2>
                  <div className="flex gap-2">
                    <Button className="bg-[#0078D7] hover:bg-[#005a9e] rounded-none">
                      Все друзья
                    </Button>
                    <Button variant="outline" className="rounded-none border-2">
                      Заявки в друзья
                    </Button>
                    <Button onClick={() => setIsFindFriendsOpen(true)} variant="outline" className="rounded-none border-2">
                      <Icon name="Search" size={16} className="mr-2" />
                      Найти друзей
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <Card key={friend.id} className={`p-6 rounded-none border-2 ${borderColor} ${cardBg}`}>
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3">
                          <Avatar className="h-24 w-24 rounded-none">
                            <AvatarFallback className="bg-[#00BCF2] text-white rounded-none text-2xl font-bold">
                              {friend.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {friend.status === 'online' && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#7FBA00] border-2 border-white"></div>
                          )}
                        </div>
                        <h3 className={`font-semibold mb-2 ${textColor}`}>{friend.name}</h3>
                        <Badge className={`${friend.status === 'online' ? 'bg-[#7FBA00]' : 'bg-gray-400'} rounded-none`}>
                          {friend.status === 'online' ? 'В сети' : 'Не в сети'}
                        </Badge>
                        <div className="flex gap-2 mt-4 w-full">
                          <Button variant="outline" size="sm" className="flex-1 rounded-none border-2">
                            <Icon name="MessageSquare" size={14} />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 rounded-none border-2">
                            <Icon name="UserMinus" size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
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
                  {messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedChat(msg.id)}
                      className={`w-full p-4 flex gap-3 border-b-2 ${borderColor} hover:bg-white/5 transition-colors ${
                        selectedChat === msg.id ? `${cardBg} border-l-4 border-l-[#0078D7]` : ''
                      }`}
                    >
                      <Avatar className="h-12 w-12 rounded-none">
                        <AvatarFallback className="bg-[#00BCF2] text-white rounded-none font-bold">
                          {msg.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-semibold ${textColor}`}>{msg.name}</span>
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{msg.lastMessage}</div>
                      </div>
                      {msg.unread > 0 && (
                        <Badge className="bg-[#E81123] rounded-none h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {msg.unread}
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
                          {messages.find((m) => m.id === selectedChat)?.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className={`font-semibold ${textColor}`}>
                          {messages.find((m) => m.id === selectedChat)?.name}
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
                        <div className="flex justify-end">
                          <div className="bg-[#0078D7] text-white p-3 max-w-md">
                            <p>Привет! Как твои дела?</p>
                            <span className="text-xs opacity-70">10:20</span>
                          </div>
                        </div>
                        <div className="flex">
                          <div className={`${cardBg} border-2 ${borderColor} p-3 max-w-md`}>
                            <p className={textColor}>Отлично, спасибо! У тебя как?</p>
                            <span className="text-xs text-gray-500">10:22</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-[#0078D7] text-white p-3 max-w-md">
                            <p>Тоже хорошо! Работаю над новым проектом</p>
                            <span className="text-xs opacity-70">10:24</span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className={`p-4 border-t-2 ${borderColor} ${cardBg}`}>
                      <div className="flex gap-2 mb-2">
                        <Button variant="ghost" size="icon" className="rounded-none" onClick={() => document.getElementById('msg-file')?.click()}>
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
                        <input type="file" id="msg-file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
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
            <Input placeholder="Поиск людей..." className="rounded-none border-2" />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {searchUsers.map((user) => (
                <Card key={user.id} className="p-4 rounded-none border-2 flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-none">
                    <AvatarFallback className="bg-[#00BCF2] text-white rounded-none text-xl font-bold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.mutualFriends} общих друзей</p>
                  </div>
                  <Button onClick={() => handleAddFriend(user.name)} className="bg-[#7FBA00] hover:bg-[#6a9e00] rounded-none">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Добавить
                  </Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
