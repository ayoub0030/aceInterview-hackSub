-- Add a second predefined system design problem

INSERT INTO design_assessments (
  id,
  title,
  description,
  rubric,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Design a Real-time Chat Application',
  'Design a scalable real-time chat application that supports:
- Multiple users in chat rooms
- Real-time message delivery
- User presence (online/offline status)
- Message history and search
- File sharing capability
- Typing indicators
- Read receipts

Requirements:
- Support 1 million concurrent users
- Message latency < 100ms
- 99.99% uptime
- Handle peak traffic of 100k messages/second

Consider:
- How would you handle real-time synchronization?
- What database would you use for messages?
- How would you scale the WebSocket connections?
- How would you ensure message ordering?
- How would you handle offline users?',
  'Grading Rubric for Real-time Chat Application:

## 1. RELIABILITY (0-10)
Evaluate how the candidate handles:
- Message delivery guarantees (at-least-once, exactly-once)
- Connection failures and reconnection logic
- Data persistence and backup strategies
- Handling of concurrent user operations
- Error recovery mechanisms

## 2. SCALABILITY (0-10)
Evaluate:
- Horizontal scaling of WebSocket servers
- Database scaling for message storage
- Load balancing strategy
- Caching layer for frequently accessed data
- Handling of message queue for peak traffic

## 3. AVAILABILITY (0-10)
Evaluate:
- Redundancy in critical components
- Failover mechanisms for servers
- Database replication strategy
- Geographic distribution
- Health monitoring and recovery

## 4. COMMUNICATION (0-10)
Evaluate:
- Clarity of architecture explanation
- Justification of technology choices
- Responsiveness to questions
- Understanding of real-time constraints
- Ability to explain trade-offs

## 5. TRADE-OFF ANALYSIS (0-10)
Evaluate:
- Discussion of consistency vs availability
- Synchronous vs asynchronous messaging
- In-memory caching vs database queries
- Real-time vs eventual consistency
- Cost vs performance considerations',
  NOW(),
  NOW()
);
