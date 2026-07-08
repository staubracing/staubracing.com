---
title: "The $80 Computer Running My Digital Life"
date: 2025-06-15
updated: 2026-02-16
description: "How a Raspberry Pi 5, an external drive, and a healthy disrespect for subscription fees turned into the backbone of my entire digital setup"
tags:
  ["raspberry-pi", "home-server", "linux", "automation", "self-hosted", "navidrome", "nextcloud"]
author: "StaubRacing"
featured: true
category: "code"
---

Let me tell you how a credit card-sized computer ended up running more of my life than I ever planned.

It started the way these things always start , with spite. I was staring at another round of subscription renewals. Cloud storage here, music streaming there, backup service over there. Fifteen bucks a month doesn't sound like much until you realize you're paying rent on your own data. Files I created, music I own, photos I took , all held hostage behind someone else's login page.

So I bought a Raspberry Pi. And then things got out of hand.

## The Hardware (What's Actually on the Shelf)

The heart of the operation is a **Raspberry Pi 5** with 16GB of RAM. Sitting next to it is a 4TB external drive doing NAS duty. That's it. That's the whole data center.

No rack mount. No Synology. No blinking lights in a closet. Just a tiny computer and a drive, plugged into the router, doing more useful work than half the cloud services I used to pay for.

Total investment? Under $200 for the whole stack. That's less than a year of the subscriptions it replaced.

## What's Actually Running

Here's the thing about homelab content on the internet , everyone shows you the twenty-container Docker stack with Grafana dashboards and reverse proxies and monitoring tools monitoring other monitoring tools. Nobody tells you that most of that stuff gets set up once, tinkered with for a weekend, and never looked at again.

So here's what I'm _actually_ running. Not what I planned to run. Not what looked cool on r/selfhosted. What survived contact with reality.

### Nextcloud , The Cloud, Except It's Mine

This is the workhorse. File sync across every device I own , laptop, phone, tablet. Contacts. Calendar. The works.

Is it as polished as Google Drive? No. Does the sync client occasionally do something weird that makes me open a terminal at 11pm? Yes. Do I care? Not even a little. My files live on hardware I can physically touch, and nobody's training an AI model on my data.

The backup angle is where it really earns its keep. My laptop backs up to Nextcloud, Nextcloud lives on the external drive. If my laptop dies tomorrow, I lose nothing. I've tested this. Not on purpose , but I've tested it.

### Navidrome , The One That Surprised Me

I did not expect a self-hosted music server to become the thing I use most. But here we are.

Navidrome serves my entire music library , the stuff I actually own, ripped from CDs, bought from Bandcamp, accumulated over twenty years of questionable taste. It runs a Subsonic-compatible API, which means any Subsonic client on any platform just works. Phone, desktop, car , doesn't matter.

The audio quality is better than Spotify because I'm playing my own FLACs, not whatever compressed stream the algorithm decided I deserve. And there's something deeply satisfying about building a playlist without an algorithm trying to sell me a mood.

### Backups , rclone, cron, and Trust Issues

Nobody writes blog posts about backup systems because they're not sexy. They just sit there, quietly doing their job, until the one day you need them and suddenly they're the most important thing you've ever built.

My setup is deliberately stupid simple. rclone runs on a cron schedule. It syncs what needs syncing. No orchestration platform. No backup-of-the-backup-of-the-backup pipeline. Just a script that runs at the same time every day and does exactly one thing right.

I've seen people build backup systems so complicated that the backup system itself needs a backup. That's how you end up with a recovery plan that requires three hours of debugging before you can recover anything. A cron job doesn't have dependencies. It doesn't have a web UI that needs updating. It either runs or it doesn't, and you know which one within thirty seconds.

## What Didn't Make the Cut (Yet)

This is the part nobody talks about , the gap between what you planned to run and what you actually ended up with.

When I started this project, I had the full homelab fantasy. Plex for movies and TV. Pi-hole for network-wide ad blocking. Home Assistant for smart home automation. The whole stack, neatly containerized, beautifully monitored.

Here's what actually happened: I got Nextcloud and Navidrome running, they solved the problems I actually had, and the rest stayed on the to-do list. Not because they're bad tools , they're excellent. But there's a difference between a tool that solves a problem you have and a tool that solves a problem you think you should have.

**Plex** is still on the radar. I have the media library for it, and video serving is the next logical step. It's happening , just hasn't happened yet. One project at a time.

**Pi-hole** I still want. Network-wide ad blocking is genuinely useful, not just a flex. But the Pi is handling its current workload clean, and I didn't want to start stacking services until I was sure the foundation was solid.

**Home Assistant** is the one I keep circling. I have smart devices. I have automation ideas. I have the hardware to run it. What I don't have is a free weekend where I trust myself not to disappear into a YAML configuration rabbit hole for sixteen hours. It's coming. Probably.

The honest truth is that a homelab is never done. It's a living thing. You add what you need, when you need it, and you resist the urge to build the Death Star on day one. The stuff that's running now runs well because I didn't try to do everything at once.

## What I'd Do Differently

**Start with the external drive from day one.** I messed around with SD card storage early on and it's not worth the anxiety. SD cards in Pis are fine for the OS, but the second you're storing anything you care about, get it off the card.

**Don't over-plan.** My original notes had a twelve-service stack mapped out. Three of them are running. The other nine might happen someday, or they might not, and that's fine. The best homelab is the one that's actually running, not the one that's perfectly architected in a Notion doc.

**Document as you go.** I didn't, and I've already forgotten how I configured half of what's running. If future me has to rebuild this, past me owes him an apology.

## The Numbers

**Hardware cost**: ~$200 (Pi 5 + drive + power + case)
**Monthly subscriptions replaced**: ~$25
**Break-even point**: 8 months
**Current uptime**: Embarrassingly good for something I set up on a Saturday afternoon

## What's Next

Plex is the next service going up. The external drive has the space, the Pi 5 has the muscle for 1080p transcoding, and I'm tired of deciding which streaming service has the movie I want to watch tonight.

After that, Pi-hole. Then we'll see. The whole point of this setup is that it grows with what I actually need, not what some YouTube homelab tour told me I should want.

The $80 computer is earning its keep. And unlike every cloud service I've ever used, it's never once asked me to upgrade to a premium tier.
