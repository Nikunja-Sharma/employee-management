# Employee Leave Dashboard - User Guide

## Dashboard Layout

### 1. Summary Cards (Top Section)

```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│   Total Allocated       │     Total Used          │   Total Remaining       │
│   [Blue Card]           │   [Orange Card]         │   [Green Card]          │
│                         │                         │                         │
│   📄 244 days           │   📅 0 days             │   ✓ 244 days            │
│   per year              │   taken                 │   available             │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### 2. Detailed Leave Balance Grid

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Leave Balance Details - Year 2026                                       │
├──────────────────┬──────────────────┬──────────────────┬────────────────┤
│  Casual Leave    │  Sick Leave      │  Annual Leave    │  Emergency     │
│  [Green Border]  │  [Green Border]  │  [Green Border]  │  [Green]       │
│  ▓▓░░░░░░░░ 0%   │  ▓▓░░░░░░░░ 0%   │  ▓▓░░░░░░░░ 0%   │  ░░░░░░░░ 0%   │
│  Total: 12 days  │  Total: 12 days  │  Total: 15 days  │  Total: 5 days │
│  Used: 0 days    │  Used: 0 days    │  Used: 0 days    │  Used: 0 days  │
│  Remaining: 12   │  Remaining: 12   │  Remaining: 15   │  Remaining: 5  │
├──────────────────┼──────────────────┼──────────────────┼────────────────┤
│  Maternity       │  Paternity       │  Other           │                │
│  [Green Border]  │  [Green Border]  │  [Green Border]  │                │
│  ░░░░░░░░░░ 0%   │  ░░░░░░░░░░ 0%   │  ░░░░░░░░░░ 0%   │                │
│  Total: 180 days │  Total: 15 days  │  Total: 5 days   │                │
│  Used: 0 days    │  Used: 0 days    │  Used: 0 days    │                │
│  Remaining: 180  │  Remaining: 15   │  Remaining: 5    │                │
└──────────────────┴──────────────────┴──────────────────┴────────────────┘
```

## Color Coding System

### Card Border Colors
- **Green Border** (0-49% used): Plenty of leaves available ✓
- **Orange Border** (50-79% used): Moderate usage ⚠️
- **Red Border** (80-100% used): Running low ⚠️⚠️

### Progress Bar Colors
- **Green Bar**: Healthy leave balance
- **Orange Bar**: Approaching limit
- **Red Bar**: Critical - few leaves remaining

## Example Scenarios

### Scenario 1: Fresh Employee (No Leaves Used)
```
Total Allocated: 244 days
Total Used: 0 days
Total Remaining: 244 days

All leave types show:
- Green borders
- 0% usage
- Full balance available
```

### Scenario 2: Mid-Year Employee (Some Leaves Used)
```
Total Allocated: 244 days
Total Used: 25 days
Total Remaining: 219 days

Example breakdown:
- Casual: 12 total, 5 used, 7 remaining (42% - Orange)
- Sick: 12 total, 8 used, 4 remaining (67% - Orange)
- Annual: 15 total, 12 used, 3 remaining (80% - Red)
```

### Scenario 3: Heavy Usage (Running Low)
```
Total Allocated: 244 days
Total Used: 200 days
Total Remaining: 44 days

Most leave types show:
- Red borders
- 80%+ usage
- Limited balance
```

## Apply Leave Form Enhancement

When applying for leave, you'll see:

```
┌─────────────────────────────────────────────┐
│  Apply for Leave                            │
├─────────────────────────────────────────────┤
│  Leave Type: [Casual Leave ▼]               │
│  ┌─────────────────────────────────────┐    │
│  │ ℹ️ Available: 12 days remaining     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Start Date: [2026-05-18]                   │
│  End Date: [2026-05-20]                     │
│  Total Days: 3                              │
│                                             │
│  Reason: [Text area...]                     │
│                                             │
│  [Cancel]  [Submit Application]             │
└─────────────────────────────────────────────┘
```

## How to Use

### Viewing Your Leave Balance

1. **Navigate to Leave Management**
   - Click on "Leave Management" in the sidebar
   - Dashboard loads automatically at the top

2. **Check Summary**
   - View the three summary cards for quick overview
   - See total allocated, used, and remaining leaves

3. **Review Detailed Balance**
   - Scroll down to see individual leave types
   - Check progress bars for visual representation
   - Note the color coding for usage levels

### Applying for Leave

1. **Click "Apply for Leave" button**
   - Located in the top-right corner

2. **Select Leave Type**
   - Choose from dropdown
   - See remaining balance for that type immediately

3. **Choose Dates**
   - Select start and end dates
   - System calculates total days automatically

4. **Provide Reason**
   - Enter reason for leave (required)
   - Max 500 characters

5. **Submit**
   - Click "Submit Application"
   - Dashboard refreshes automatically
   - Balance updates after admin approval

### Monitoring Leave Status

Below the dashboard, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  My Leave Applications                                      │
│  [All Leaves] [Pending] [Approved] [Rejected]               │
├──────────────┬────────────┬──────┬──────────┬──────────────┤
│ Leave Type   │ Dates      │ Days │ Status   │ Actions      │
├──────────────┼────────────┼──────┼──────────┼──────────────┤
│ Casual       │ May 18-20  │ 3    │ Pending  │ [Cancel]     │
│ Sick         │ May 10-12  │ 3    │ Approved │ -            │
│ Annual       │ Apr 15-20  │ 6    │ Rejected │ Admin: ...   │
└──────────────┴────────────┴──────┴──────────┴──────────────┘
```

## Tips

1. **Plan Ahead**: Check your balance before applying for long leaves
2. **Color Indicators**: Pay attention to red/orange warnings
3. **Leave Type**: Choose the appropriate leave type for accurate tracking
4. **Balance Updates**: Balance updates only after admin approves leave
5. **Year-based**: Balance resets at the start of each year

## Frequently Asked Questions

**Q: When does my leave balance update?**
A: Balance updates immediately after admin approves or rejects your leave application.

**Q: Why is my balance showing 0?**
A: Contact your admin to initialize your leave balance. It should be set up automatically.

**Q: Can I apply for more leaves than I have?**
A: The system will show your remaining balance, but admin has final approval authority.

**Q: What happens to unused leaves?**
A: Check with your HR policy. The system resets balance yearly based on admin configuration.

**Q: How do I know if I'm running low on leaves?**
A: Cards turn orange (50-79% used) or red (80%+ used) to warn you.

## Support

If you encounter any issues:
1. Refresh the page
2. Check your internet connection
3. Contact your system administrator
4. Report bugs to IT support

---

**Note**: This dashboard provides real-time visibility into your leave balance, helping you make informed decisions about leave applications.
