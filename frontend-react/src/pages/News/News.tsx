import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink, ChevronRight, AlertCircle, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  image_url?: string;
  description: string;
  source_id: string;
};

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  useEffect(() => {
    const fetchFinanceNews = async () => {
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${apiKey}&category=business&language=en&size=10`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticles(data.results || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to fetch finance news. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-lg py-20">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-foreground mb-2">Loading Market News</h2>
            <p className="text-muted-foreground">Fetching latest financial insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-lg py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Connection Error</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
      {/* Header */}
      <section className="border-b dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-lg py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Market <span className="text-blue-500">Intelligence</span>
              </h1>
              <p className="mt-1 text-muted-foreground">
                Real-time financial insights & analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-medium text-muted-foreground">Live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container mx-auto px-4 md:px-8 max-w-screen-lg py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Articles</p>
              <p className="text-2xl font-bold">{articles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Sources</p>
              <p className="text-2xl font-bold">{new Set(articles.map(a => a.source_id)).size}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="text-2xl font-bold">Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Coverage</p>
              <p className="text-2xl font-bold">Global</p>
            </CardContent>
          </Card>
        </div>

        {/* News Articles */}
        <div className="mt-8 space-y-4">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Source & Time */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {article.source_id}
                        </span>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatTimeAgo(article.pubDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-foreground group-hover:text-blue-500 transition-colors duration-200 mb-2 leading-snug">
                        {article.title}
                      </h2>

                      {/* Description */}
                      {article.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {article.description}
                        </p>
                      )}

                      {/* Read more */}
                      <div className="flex items-center text-sm font-medium text-blue-500 group-hover:text-blue-600 transition-colors">
                        Read full article
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {article.image_url && (
                      <div className="hidden sm:block flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={article.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Fallback icon when no image */}
                    {!article.image_url && (
                      <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-950 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Empty state */}
        {articles.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <Newspaper className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">No articles found</h3>
              <p className="text-muted-foreground">Check back soon for the latest financial news.</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 mb-8 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by real-time market data · Updates every minute
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;