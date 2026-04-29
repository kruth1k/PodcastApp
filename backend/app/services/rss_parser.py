import feedparser
from datetime import datetime
from typing import Dict, List, Optional

def parse_duration(duration_str: Optional[str]) -> Optional[int]:
    if not duration_str:
        return None
    
    try:
        if duration_str.isdigit():
            return int(duration_str)
        
        parts = duration_str.split(':')
        if len(parts) == 3:
            hours, minutes, seconds = map(int, parts)
            return hours * 3600 + minutes * 60 + seconds
        elif len(parts) == 2:
            minutes, seconds = map(int, parts)
            return minutes * 60 + seconds
        return int(duration_str)
    except:
        return None

def parse_feed(url: str) -> Dict:
    feed = feedparser.parse(url)
    
    if not feed.entries:
        raise ValueError("No entries found in RSS feed")
    
    channel = feed.feed
    
    podcast_data = {
        "title": channel.get("title", "Unknown Podcast"),
        "description": channel.get("description") or channel.get("summary"),
        "feed_url": url,
        "image_url": None,
        "author": channel.get("author"),
        "episodes": []
    }
    
    if hasattr(channel, "image"):
        podcast_data["image_url"] = channel.image.get("href")
    elif hasattr(channel, "itunes_image"):
        podcast_data["image_url"] = channel.itunes_image.get("href")
    
    for entry in feed.entries[:50]:
        episode = {
            "title": entry.get("title", "Unknown Episode"),
            "description": entry.get("description") or entry.get("summary"),
            "guid": entry.get("id") or entry.get("link"),
            "audio_url": "",
            "duration": None,
            "published_at": None
        }
        
        if hasattr(entry, "enclosures") and entry.enclosures:
            for enclosure in entry.enclosures:
                if enclosure.type and enclosure.type.startswith("audio"):
                    episode["audio_url"] = enclosure.url
                    break
        
        if hasattr(entry, "itunes_duration"):
            episode["duration"] = parse_duration(str(entry.itunes_duration))
        
        if hasattr(entry, "published") and entry.published:
            try:
                episode["published_at"] = datetime.fromisoformat(entry.published.replace("+00:00", ""))
            except:
                try:
                    episode["published_at"] = datetime.strptime(entry.published, "%a, %d %b %Y %H:%M:%S %z")
                except:
                    episode["published_at"] = None
        
        if episode["audio_url"]:
            podcast_data["episodes"].append(episode)
    
    return podcast_data