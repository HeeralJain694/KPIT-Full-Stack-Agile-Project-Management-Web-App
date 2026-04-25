Database Schema

Project
id
name
description
createdAt

User Story
id
title
projectId (FK)

Task
id
title
status
storyId (FK)

Relationships
One Project → Many User Stories
One User Story → Many Tasks
