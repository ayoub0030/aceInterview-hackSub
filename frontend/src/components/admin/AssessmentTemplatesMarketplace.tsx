import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Badge,
} from '@mui/material';
import {
  Store,
  Download,
  Preview,
  Star,
  TrendingUp,
  Category,
  AccessTime,
  Person,
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Visibility,
  Favorite,
  Share,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  questions_count: number;
  author: string;
  author_id: string;
  rating: number;
  downloads: number;
  price: number;
  is_free: boolean;
  tags: string[];
  preview_url?: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_premium: boolean;
}

interface MarketplaceStats {
  total_templates: number;
  free_templates: number;
  premium_templates: number;
  total_downloads: number;
  average_rating: number;
  top_categories: Array<{
    category: string;
    count: number;
  }>;
  featured_templates: Template[];
}

export default function AssessmentTemplatesMarketplace() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'downloads'>('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchMarketplaceData();
  }, [selectedCategory, selectedDifficulty, priceFilter, sortBy, searchTerm]);

  const fetchMarketplaceData = async () => {
    try {
      const [templatesRes, statsRes] = await Promise.all([
        supabase.from('assessment_templates_marketplace').select('*'),
        supabase.from('marketplace_stats').select('*').single(),
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (statsRes.error) throw statsRes.error;

      setTemplates(templatesRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      const mockData = getMockMarketplaceData();
      setTemplates(mockData.templates);
      setStats(mockData.stats);
    } finally {
      setLoading(false);
    }
  };

  const getMockMarketplaceData = () => ({
    templates: [
      {
        id: '1',
        name: 'React Frontend Assessment',
        description: 'Comprehensive React assessment covering hooks, state management, and component architecture',
        category: 'Frontend',
        difficulty: 'intermediate',
        duration: 60,
        questions_count: 15,
        author: 'TechAssess Pro',
        author_id: 'author-1',
        rating: 4.8,
        downloads: 1250,
        price: 0,
        is_free: true,
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
        preview_url: '/templates/react-preview.png',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
        is_featured: true,
        is_premium: false,
      },
      {
        id: '2',
        name: 'System Design Interview',
        description: 'Advanced system design assessment for senior engineers covering scalability and architecture',
        category: 'System Design',
        difficulty: 'advanced',
        duration: 90,
        questions_count: 8,
        author: 'Design Masters',
        author_id: 'author-2',
        rating: 4.9,
        downloads: 890,
        price: 29.99,
        is_free: false,
        tags: ['System Design', 'Architecture', 'Scalability', 'Senior'],
        preview_url: '/templates/system-design-preview.png',
        created_at: '2024-01-08T09:00:00Z',
        updated_at: '2024-01-14T16:00:00Z',
        is_featured: true,
        is_premium: true,
      },
      {
        id: '3',
        name: 'Python Coding Challenge',
        description: 'Python programming assessment covering data structures, algorithms, and problem-solving',
        category: 'Backend',
        difficulty: 'intermediate',
        duration: 75,
        questions_count: 12,
        author: 'CodeEval',
        author_id: 'author-3',
        rating: 4.6,
        downloads: 2100,
        price: 0,
        is_free: true,
        tags: ['Python', 'Algorithms', 'Data Structures', 'Backend'],
        preview_url: '/templates/python-preview.png',
        created_at: '2024-01-05T11:00:00Z',
        updated_at: '2024-01-12T13:00:00Z',
        is_featured: false,
        is_premium: false,
      },
      {
        id: '4',
        name: 'Behavioral Interview Suite',
        description: 'Complete behavioral assessment covering communication, teamwork, and problem-solving skills',
        category: 'Soft Skills',
        difficulty: 'beginner',
        duration: 45,
        questions_count: 20,
        author: 'HR Solutions',
        author_id: 'author-4',
        rating: 4.5,
        downloads: 3200,
        price: 19.99,
        is_free: false,
        tags: ['Behavioral', 'Communication', 'Teamwork', 'Soft Skills'],
        preview_url: '/templates/behavioral-preview.png',
        created_at: '2024-01-03T08:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        is_featured: false,
        is_premium: true,
      },
    ],
    stats: {
      total_templates: 150,
      free_templates: 85,
      premium_templates: 65,
      total_downloads: 45000,
      average_rating: 4.6,
      top_categories: [
        { category: 'Frontend', count: 35 },
        { category: 'Backend', count: 28 },
        { category: 'System Design', count: 22 },
        { category: 'Soft Skills', count: 18 },
        { category: 'Mobile', count: 15 },
        { category: 'DevOps', count: 12 },
      ],
      featured_templates: [],
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f57c00';
      case 'expert': return '#f44336';
      default: return '#757575';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Frontend': '#2196f3',
      'Backend': '#4caf50',
      'System Design': '#ff9800',
      'Soft Skills': '#9c27b0',
      'Mobile': '#00bcd4',
      'DevOps': '#795548',
    };
    return colors[category] || '#757575';
  };

  const handleDownloadTemplate = async (template: Template) => {
    try {
      // Simulate download
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, downloads: t.downloads + 1 }
          : t
      ));

      toast.success(`Template "${template.name}" downloaded successfully`);
    } catch (error: any) {
      toast.error('Failed to download template', {
        description: error.message,
      });
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && template.difficulty !== selectedDifficulty) return false;
    if (priceFilter !== 'all') {
      if (priceFilter === 'free' && !template.is_free) return false;
      if (priceFilter === 'paid' && template.is_free) return false;
    }
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !template.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.downloads - a.downloads;
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating': return b.rating - a.rating;
      case 'downloads': return b.downloads - a.downloads;
      default: return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading marketplace...</Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>No marketplace data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
          Assessment Templates Marketplace
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: 'rgba(98,0,69,0.8)',
            '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
          }}
        >
          Create Template
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(20, 80, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.total_templates}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Templates
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.4) 0%, rgba(50, 80, 40, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.free_templates}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Free Templates
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(180, 140, 20, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.total_downloads.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Downloads
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.4) 0%, rgba(100, 20, 140, 0.5) 100%)' }}>
            <CardContent>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                {stats.average_rating.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'rgba(98,0,69,0.3)' },
                  '& input': { color: 'white' },
                },
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {stats.top_categories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Price</InputLabel>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(98,0,69,0.3)' },
                }}
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="downloads">Most Downloaded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Featured Templates */}
      {filteredTemplates.filter(t => t.is_featured).length > 0 && (
        <Paper sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: '#ffd700' }} />
            Featured Templates
          </Typography>
          <Grid container spacing={2}>
            {filteredTemplates.filter(t => t.is_featured).slice(0, 3).map((template) => (
              <Grid item xs={12} md={4} key={template.id}>
                <Card sx={{ background: 'rgba(255,255,255,0.05)', height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', mb: 1 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          by {template.author}
                        </Typography>
                      </Box>
                      <Badge
                        badgeContent="FEATURED"
                        color="warning"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={template.category}
                        size="small"
                        sx={{
                          bgcolor: getCategoryColor(template.category),
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                      <Chip
                        label={template.difficulty}
                        size="small"
                        sx={{
                          bgcolor: getDifficultyColor(template.difficulty),
                          color: 'white',
                          fontSize: '0.6rem',
                        }}
                      />
                      {template.is_free ? (
                        <Chip
                          label="FREE"
                          size="small"
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontSize: '0.6rem',
                          }}
                        />
                      ) : (
                        <Chip
                          label={`$${template.price}`}
                          size="small"
                          sx={{
                            bgcolor: '#ff9800',
                            color: 'white',
                            fontSize: '0.6rem',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={template.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          ({template.downloads} downloads)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {template.duration}min
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Preview />}
                        onClick={() => handlePreviewTemplate(template)}
                        sx={{
                          borderColor: 'rgba(98,0,69,0.5)',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.8rem',
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownloadTemplate(template)}
                        sx={{
                          bgcolor: 'rgba(98,0,69,0.8)',
                          '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
                          fontSize: '0.8rem',
                        }}
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* All Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontSize: '1rem', mb: 1 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      by {template.author}
                    </Typography>
                  </Box>
                  {template.is_featured && (
                    <Star sx={{ color: '#ffd700', fontSize: 20 }} />
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                  {template.description.length > 100 
                    ? `${template.description.substring(0, 100)}...` 
                    : template.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={template.category}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(template.category),
                      color: 'white',
                      fontSize: '0.6rem',
                    }}
                  />
                  <Chip
                    label={template.difficulty}
                    size="small"
                    sx={{
                      bgcolor: getDifficultyColor(template.difficulty),
                      color: 'white',
                      fontSize: '0.6rem',
                    }}
                  />
                  {template.is_free ? (
                    <Chip
                      label="FREE"
                      size="small"
                      sx={{
                        bgcolor: '#4caf50',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  ) : (
                    <Chip
                      label={`$${template.price}`}
                      size="small"
                      sx={{
                        bgcolor: '#ff9800',
                        color: 'white',
                        fontSize: '0.6rem',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(98,0,69,0.3)',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '0.6rem',
                      }}
                    />
                  ))}
                  {template.tags.length > 3 && (
                    <Chip
                      label={`+${template.tags.length - 3}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.6rem',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={template.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {template.rating} ({template.downloads})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {template.duration}min
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {template.questions_count} questions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewTemplate(template)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadTemplate(template)}
                        sx={{ color: 'rgba(98,0,69,1)' }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add to Favorites">
                      <IconButton
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <Favorite fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'rgba(98,0,69,0.9)', color: 'white' }}>
          Template Preview - {selectedTemplate?.name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(20,20,25,0.95)', pt: 3 }}>
          {selectedTemplate && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Template Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Category:</strong> {selectedTemplate.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Difficulty:</strong> {selectedTemplate.difficulty}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Duration:</strong> {selectedTemplate.duration} minutes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Questions:</strong> {selectedTemplate.questions_count}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Author:</strong> {selectedTemplate.author}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Price:</strong> {selectedTemplate.is_free ? 'Free' : `$${selectedTemplate.price}`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Statistics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Rating:</strong> {selectedTemplate.rating}/5.0
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Downloads:</strong> {selectedTemplate.downloads.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Created:</strong> {new Date(selectedTemplate.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Last Updated:</strong> {new Date(selectedTemplate.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                  {selectedTemplate.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedTemplate.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(98,0,69,0.3)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20,20,25,0.95)', p: 3 }}>
          <Button
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Close
          </Button>
          {selectedTemplate && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownloadTemplate(selectedTemplate)}
              sx={{
                bgcolor: 'rgba(98,0,69,0.8)',
                '&:hover': { bgcolor: 'rgba(98,0,69,1)' },
              }}
            >
              Download Template
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
