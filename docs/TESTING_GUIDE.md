# GitHub Command Deck - Testing Guide

## 🎯 How to Test the Application

The dev server is running at **http://localhost:3000**

Follow these steps to verify everything works:

---

## ✅ Pre-Flight Checklist

Before testing, ensure:
- [x] Dev server is running (`npm run dev`)
- [x] You have a Tambo API key set in `.env.local`
- [x] Optionally, set `GITHUB_TOKEN` for higher rate limits

---

## 🧪 Test Scenarios

### Test 1: Basic Repository Analysis

**Query:** `Analyze facebook/react`

**Expected Behavior:**
1. Left panel shows AI response with text summary
2. Right panel displays:
   - Repository overview card OR
   - Commit activity graph OR
   - Both components

**What to Check:**
- ✅ Right panel is NOT empty
- ✅ Component renders without errors
- ✅ Data looks correct (stars, forks, etc.)
- ✅ Smooth fade-in animation

**If it fails:**
- Check browser console for errors
- Verify Tambo API key is set
- Check if GitHub API is accessible

---

### Test 2: Pull Requests

**Query:** `Show me the pull requests for facebook/react`

**Expected Behavior:**
1. AI fetches PRs using `getPullRequests` tool
2. Right panel displays `PRViewer` component
3. Shows list of PRs with:
   - PR number and title
   - Author avatar and name
   - Status (open/closed/merged)
   - Stats (additions/deletions)
   - Labels

**What to Check:**
- ✅ PRViewer component renders
- ✅ Shows multiple PRs (up to 20)
- ✅ Status badges are color-coded
- ✅ Links to GitHub work

**If it fails:**
- Check if `getPullRequests` tool is registered
- Verify PRViewer component is registered
- Check browser console for errors

---

### Test 3: PR Diff (CRITICAL TEST)

**Query:** `Show me the diff for PR #28444` (use a real PR number from facebook/react)

**Expected Behavior:**
1. AI fetches PR files using `getPRDiff` tool
2. Right panel displays `DiffViewer` component
3. Shows:
   - List of changed files
   - File status (Added/Modified/Removed)
   - Syntax-highlighted diffs
   - Line numbers
   - Additions/deletions per file

**What to Check:**
- ✅ DiffViewer component renders
- ✅ Shows file list
- ✅ Diffs are syntax-highlighted
- ✅ Can expand/collapse files
- ✅ Shows additions (+) in green
- ✅ Shows deletions (-) in red

**If it fails:**
- This was the main issue before - verify it's fixed
- Check if `getPRDiff` tool is registered
- Verify DiffViewer component is registered
- Check browser console for errors
- Try a different PR number

---

### Test 4: Repository Comparison

**Query:** `Compare facebook/react with vuejs/vue`

**Expected Behavior:**
1. AI fetches both repos using `compareRepositories` tool
2. Right panel displays `ComparisonTable` component
3. Shows side-by-side comparison:
   - Stars
   - Forks
   - Open issues
   - Language
   - Best values highlighted

**What to Check:**
- ✅ ComparisonTable renders
- ✅ Shows both repositories
- ✅ Metrics are side-by-side
- ✅ Best values are highlighted
- ✅ Data looks accurate

---

### Test 5: Data Visualization

**Query:** `Graph the commit activity for facebook/react`

**Expected Behavior:**
1. AI fetches commits using `getCommitActivity` tool
2. Right panel displays `Graph` component
3. Shows line chart with:
   - X-axis: Time/dates
   - Y-axis: Number of commits
   - Interactive tooltips
   - Smooth line

**What to Check:**
- ✅ Graph component renders
- ✅ Chart displays correctly
- ✅ Data points are visible
- ✅ Tooltips work on hover
- ✅ Axes are labeled

---

### Test 6: Contributors

**Query:** `Who are the top contributors to facebook/react?`

**Expected Behavior:**
1. AI fetches contributors using `getContributors` tool
2. Right panel displays data (could be Graph, DataCard, or text)
3. Shows top 10 contributors with:
   - Username
   - Avatar
   - Contribution count

**What to Check:**
- ✅ Data displays correctly
- ✅ Shows contributor names
- ✅ Contribution counts are visible

---

### Test 7: Empty State

**Action:** Refresh the page (before making any queries)

**Expected Behavior:**
1. Left panel shows empty chat
2. Right panel shows:
   - "MAIN VIEWSCREEN READY" message
   - Animated radar/circles
   - Example queries:
     - "Analyze facebook/react"
     - "Show me the pull requests"
     - "Compare with vuejs/vue"
     - "Graph commit activity"

**What to Check:**
- ✅ Empty state is clear and helpful
- ✅ Animations are smooth
- ✅ Example queries are visible
- ✅ No errors in console

---

### Test 8: Loading State

**Action:** Type a query and watch immediately

**Expected Behavior:**
1. While AI is processing:
   - Right panel shows "PROCESSING REQUEST..."
   - Spinning animation
   - "Analyzing data streams" message

**What to Check:**
- ✅ Loading state appears
- ✅ Animation is smooth
- ✅ Transitions to result smoothly

---

## 🐛 Common Issues & Fixes

### Issue 1: Right Panel is Empty
**Symptoms:** Right panel shows empty state even after query
**Causes:**
- Component not rendering
- AI not generating component
- Error in component

**Fix:**
1. Check browser console for errors
2. Verify component is registered in `src/lib/tambo.ts`
3. Check if tool is being called (look for API requests in Network tab)

### Issue 2: "Cannot render PR diffs"
**Symptoms:** AI says it can't show diffs
**Causes:**
- DiffViewer not registered
- getPRDiff tool not working
- PR number invalid

**Fix:**
1. Verify DiffViewer is in components array
2. Check getPRDiff is in tools array
3. Try a different PR number
4. Check GitHub API rate limits

### Issue 3: Components Render in Chat Instead of Right Panel
**Symptoms:** Components appear in left panel
**Causes:**
- MainViewscreen not extracting components correctly

**Fix:**
1. Check MainViewscreen.tsx logic
2. Verify `renderedComponent` is being extracted
3. Check console for errors

### Issue 4: Styling Issues
**Symptoms:** Components look broken or unstyled
**Causes:**
- Tailwind classes not loading
- CSS conflicts

**Fix:**
1. Check if Tailwind is working (other elements styled?)
2. Verify component imports
3. Check browser console for CSS errors

---

## 📊 Success Criteria

The application is working correctly if:

✅ All 8 test scenarios pass  
✅ Right panel displays components  
✅ PR diffs render correctly  
✅ No console errors  
✅ Smooth animations  
✅ Clear empty/loading states  
✅ All tools execute successfully  
✅ Components are visually polished  

---

## 🎥 Recording a Demo

For the hackathon submission, record:

1. **Opening shot:** Empty state with example queries
2. **Test 1:** "Analyze facebook/react" → Show result
3. **Test 2:** "Show pull requests" → Show PRViewer
4. **Test 3:** "Show PR diff" → Show DiffViewer (IMPORTANT!)
5. **Test 4:** "Compare with vue" → Show ComparisonTable
6. **Test 5:** "Graph commits" → Show Graph
7. **Closing:** Highlight smooth transitions and polish

**Duration:** 2-3 minutes  
**Focus:** Show that everything actually works!

---

## 🔧 Debug Mode

If you encounter issues, enable debug logging:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - Tambo API calls
   - Tool executions
   - Component renders
   - Errors (red text)

4. Check Network tab:
   - GitHub API calls
   - Response status codes
   - Response data

---

## ✅ Final Checklist

Before submitting:

- [ ] All 8 test scenarios pass
- [ ] PR diffs work correctly
- [ ] No console errors
- [ ] Smooth animations
- [ ] Demo video recorded
- [ ] Screenshots taken
- [ ] README updated
- [ ] .env.example has all required keys

---

**Good luck with the hackathon! 🚀**
