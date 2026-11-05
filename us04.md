## User Story
As a customer, I want to submit my order and receive a reference so staff can see it in a restricted order queue.

## Epic
E1-customer-ordering

## Priority
must

## Story Points
5

## Evidence ID
INT01

## Acceptance Criteria
- [ ] A valid order gets one unique reference and is saved with items, total, time slot and delivery location.
- [ ] An authorised staff user sees the new order in the staff queue; an unauthorised visitor cannot see the order list.
- [ ] A failed submission displays an error without falsely confirming success; saved orders persist on refresh.

## Dependencies / Risks
- Requires a data store and protected staff access.
- Sprint 1 demo must not collect real customer/payment data.
