# Tasks: Work Page Enhancement

## Phase 1: Database & Schema Updates

### 1.1 Update MongoDB Project Schema
- [x] Add `websiteUrl` field (required, string, URL format)
- [ ] Add `demoUrl` field (optional, string, URL format)
- [ ] Add `thumbnail` field (string, path to thumbnail image)
- [ ] Add `imageAlt` field (string, alt text for images)
- [ ] Add `isFeatured` field (boolean, defaults to false)
- [ ] Add `tags` field (array of strings, max 5 items)
- [ ] Create database indexes on `isFeatured`, `category`, and `created_at`
- [ ] Verify backward compatibility with existing documents
- [ ] Update TypeScript Project interface in `/src/types/admin.ts`

**Acceptance Criteria:**
- All new fields present in MongoDB documents
- Indexes created and verified
- Existing projects still load without errors
- TypeScript types reflect schema changes

### 1.2 Create Database Migration Script
- [ ] Create migration script for existing projects
- [ ] Set default `websiteUrl` to empty string for backward compatibility
- [ ] Set `isFeatured` to false for all existing projects
- [ ] Generate `imageAlt` from project titles if needed
- [ ] Test migration on staging database
- [ ] Document migration rollback procedure

**Acceptance Criteria:**
- Migration completes without errors
- All existing projects successfully updated
- Data integrity verified post-migration
- Rollback procedure documented

## Phase 2: Image Upload Infrastructure

### 2.1 Install & Configure Sharp Library
- [ ] Install sharp package (`npm install sharp`)
- [ ] Create image optimization utilities module
- [ ] Configure image quality settings (80% quality)
- [ ] Set up error handling for image processing
- [ ] Create utility functions for image resizing
- [ ] Add TypeScript types for image operations

**Acceptance Criteria:**
- Sharp properly installed and imported
- Image optimization functions exported and typed
- Error handling works for invalid images
- Utility functions testable

### 2.2 Create Image Upload Server Action
- [ ] Create `/src/app/actions/imageUpload.ts` server action
- [ ] Implement file validation (type, size, magic bytes)
- [ ] Implement image optimization (3 versions)
- [ ] Add filename sanitization and collision prevention
- [ ] Create EXIF metadata removal
- [ ] Implement error handling and validation
- [ ] Add TypeScript interfaces for image upload result
- [ ] Write unit tests for validation functions

**Acceptance Criteria:**
- File type validation works (PNG, JPEG, WebP)
- File size validation enforces 5MB limit
- Three image versions generated correctly
- Filenames sanitized and unique
- EXIF data removed from images
- Errors handled gracefully with specific messages
- Tests verify all validation scenarios

### 2.3 Create Image Storage Directory Structure
- [ ] Create `/public/projects/` directory
- [ ] Create `/public/projects/original/` subdirectory
- [ ] Create `/public/projects/thumbnails/` subdirectory
- [ ] Create `/public/projects/medium/` subdirectory
- [ ] Set up directory permissions
- [ ] Create .gitkeep files for git tracking

**Acceptance Criteria:**
- All directories created and accessible
- Permissions allow read/write operations
- Directory structure tracked in git

### 2.4 Implement Image Upload Error Handling
- [ ] Handle unsupported file types with specific error
- [ ] Handle oversized files with specific error
- [ ] Handle corrupted image files with fallback
- [ ] Handle disk space exhaustion gracefully
- [ ] Handle concurrent uploads without collision
- [ ] Add logging for debugging

**Acceptance Criteria:**
- All error scenarios produce appropriate user messages
- System doesn't crash on invalid input
- Logging includes useful debug information
- Recovery mechanisms functional

## Phase 3: Admin Form Enhancement

### 3.1 Update Project Form Component
- [ ] Add image file input field to form
- [ ] Add image preview display
- [ ] Add website URL field (required)
- [ ] Add demo URL field (optional)
- [ ] Integrate image upload server action
- [ ] Update form validation logic
- [ ] Add upload progress indicator
- [ ] Implement drag-and-drop for images
- [ ] Add clear error messages for each field
- [ ] Maintain existing form fields

**Acceptance Criteria:**
- All new fields visible and functional
- Image preview displays after selection
- Drag-and-drop works for file selection
- Form validates all inputs before submission
- Progress indicator shows during upload
- Error messages specific and helpful

### 3.2 Update Form Validation Logic
- [ ] Implement client-side image validation
- [ ] Implement client-side URL validation
- [ ] Implement server-side field validation
- [ ] Add max character length enforcement
- [ ] Add required field validation
- [ ] Generate specific error messages per field
- [ ] Prevent form submission with invalid data

**Acceptance Criteria:**
- Client-side validation fast and responsive
- Server-side validation prevents invalid data
- Error messages guide user to fix issues
- Form never submits with validation errors

### 3.3 Update Create/Edit Project Actions
- [ ] Update `createProjectAction` to handle images
- [ ] Update `updateProjectAction` to handle images
- [ ] Integrate image upload into project creation
- [ ] Store image paths in project document
- [ ] Handle image processing errors
- [ ] Maintain atomic create/update operations
- [ ] Add project thumbnail path to database
- [ ] Update slug generation if title changed

**Acceptance Criteria:**
- Projects created with images successfully
- Image paths stored correctly in database
- Existing projects still editable
- Project updates preserve images if unchanged
- Atomic operations (all or nothing)

### 3.4 Add Form Field Help Text & Validation
- [ ] Add help text for image upload field
- [ ] Add help text for website URL field
- [ ] Add help text for demo URL field
- [ ] Display max character counts
- [ ] Show field-specific validation rules
- [ ] Highlight required fields clearly

**Acceptance Criteria:**
- All users understand each field's purpose
- Validation rules clear before submission
- Max lengths visible to users

## Phase 4: Work Page Display Components

### 4.1 Create Featured Projects Section Component
- [ ] Create `FeaturedProjectsSection.tsx` component
- [ ] Query featured projects from database
- [ ] Display maximum 3 featured projects
- [ ] Implement responsive grid layout (1/2/3 columns)
- [ ] Add hover effects showing call-to-action
- [ ] Implement smooth fade-in animation
- [ ] Add "View All Projects" link below
- [ ] Handle case of no featured projects
- [ ] Add proper TypeScript types

**Acceptance Criteria:**
- Featured section displays correctly
- Responsive layout works on all breakpoints
- Animations smooth and performant
- Fallback for no featured projects
- Properly typed component

### 4.2 Create Project Grid Component
- [ ] Create `ProjectGrid.tsx` component
- [ ] Implement responsive grid (1/2/3 columns)
- [ ] Add lazy loading for images
- [ ] Show skeleton loaders while loading
- [ ] Implement scroll-triggered animations
- [ ] Add category filtering (optional)
- [ ] Support pagination if needed
- [ ] Handle empty state
- [ ] Add proper TypeScript types

**Acceptance Criteria:**
- Grid responsive on all breakpoints
- Images lazy load correctly
- Skeletons display during loading
- Animations smooth and performant
- Empty state handled gracefully

### 4.3 Create Project Card Component
- [ ] Create `ProjectCard.tsx` component
- [ ] Display thumbnail image (400x300)
- [ ] Display category badge
- [ ] Display project title
- [ ] Display short description (2 lines)
- [ ] Implement hover overlay effect
- [ ] Add "Read More" link on hover
- [ ] Implement smooth transitions
- [ ] Link to project detail page
- [ ] Add proper TypeScript types

**Acceptance Criteria:**
- Card layout matches design
- Image displays with correct aspect ratio
- Text truncates appropriately
- Hover effects smooth
- All interactive elements functional

### 4.4 Update WorkSection Component
- [ ] Add featured projects section above grid
- [ ] Integrate new ProjectGrid component
- [ ] Update styling for visual enhancements
- [ ] Implement animations between sections
- [ ] Test responsive behavior
- [ ] Verify performance with many projects

**Acceptance Criteria:**
- Featured and standard grid display together
- Section transitions smooth
- Performance acceptable with many projects
- Responsive on all breakpoints

### 4.5 Implement Image Lazy Loading
- [ ] Use Intersection Observer API for detection
- [ ] Create custom hook `useIntersectionObserver`
- [ ] Implement lazy loading wrapper component
- [ ] Show skeleton/placeholder during load
- [ ] Handle failed image loads
- [ ] Verify no layout shift (CLS < 0.1)
- [ ] Test on slow connections

**Acceptance Criteria:**
- Off-screen images don't load initially
- Images load when scrolled into view
- Skeleton displays during load
- No layout shift when images load
- Works on slow connections

## Phase 5: Project Detail Page Enhancement

### 5.1 Add Website & Demo URL Display
- [ ] Display "Visit Website" button on detail page
- [ ] Display "View Demo" button if demoUrl exists
- [ ] Position buttons prominently below hero image
- [ ] Make buttons mobile responsive (stacked/side-by-side)
- [ ] Add proper security attributes (noopener, noreferrer)
- [ ] Link buttons to URLs in new tabs
- [ ] Style buttons consistently with design system

**Acceptance Criteria:**
- Buttons display correctly
- Links open in new tab
- Security attributes present
- Responsive layout works
- Styling matches design system

### 5.2 Add Breadcrumb Navigation
- [ ] Create breadcrumb component
- [ ] Display path: Home > Work > Project Title
- [ ] Make links functional for navigation
- [ ] Style consistently with design system
- [ ] Ensure responsive on mobile
- [ ] Add ARIA labels for accessibility

**Acceptance Criteria:**
- Breadcrumb displays above title
- All links functional
- Responsive on mobile
- Accessible with screen readers

### 5.3 Add Related Projects Section
- [ ] Query related projects (same category)
- [ ] Exclude current project from results
- [ ] Display maximum 3 related projects
- [ ] Use same ProjectCard layout
- [ ] Add "Back to Projects" link
- [ ] Handle case of no related projects
- [ ] Optimize database query

**Acceptance Criteria:**
- Related projects display correctly
- Current project excluded
- Layout matches main grid
- Query optimized with indexes
- Empty state handled

### 5.4 Implement Image Lightbox/Modal
- [ ] Create lightbox component for hero image
- [ ] Make image clickable to open modal
- [ ] Display full-resolution image in modal
- [ ] Add close button and escape key handling
- [ ] Support keyboard navigation
- [ ] Test accessibility with screen readers

**Acceptance Criteria:**
- Modal opens when image clicked
- Full image displays in modal
- Modal closes properly
- Keyboard navigation works
- Accessible design

## Phase 6: Performance Optimization

### 6.1 Implement ISR (Incremental Static Regeneration)
- [ ] Configure ISR in work page getStaticProps
- [ ] Set revalidation time (24 hours)
- [ ] Implement on-demand revalidation
- [ ] Trigger revalidation on project create/update/delete
- [ ] Revalidate related pages (detail pages, homepage)
- [ ] Test ISR functionality

**Acceptance Criteria:**
- Work page cached and served statically
- Revalidation triggers on changes
- Page reflects updates within minutes
- No 404 errors from changed URLs

### 6.2 Optimize Image Serving
- [ ] Configure Next.js Image component properly
- [ ] Set responsive srcset for all images
- [ ] Implement appropriate sizes attribute
- [ ] Add cache-control headers for images
- [ ] Set browser cache duration (1 year)
- [ ] Test image loading on slow connections

**Acceptance Criteria:**
- Images load quickly
- Responsive srcset works correctly
- Browser caching configured
- Appropriate formats served per browser

### 6.3 Optimize Database Queries
- [ ] Use projection to fetch only needed fields
- [ ] Verify indexes used in queries
- [ ] Add query monitoring/logging
- [ ] Optimize pagination queries
- [ ] Test query performance
- [ ] Document query patterns

**Acceptance Criteria:**
- Queries execute efficiently
- Indexes properly utilized
- Query time < 100ms for list queries
- Pagination performs well

### 6.4 Test Core Web Vitals
- [ ] Measure First Contentful Paint (target < 1.5s)
- [ ] Measure Largest Contentful Paint (target < 2.5s)
- [ ] Measure Cumulative Layout Shift (target < 0.1)
- [ ] Test on various network speeds
- [ ] Use Lighthouse for automated testing
- [ ] Document performance results

**Acceptance Criteria:**
- FCP < 1.5 seconds
- LCP < 2.5 seconds
- CLS < 0.1
- Performance consistent across devices

## Phase 7: Security & Validation

### 7.1 Implement Comprehensive Input Validation
- [ ] Add magic byte verification for images
- [ ] Implement file size validation
- [ ] Validate URLs with strict parsing
- [ ] Sanitize filenames for path traversal
- [ ] Escape user input for display
- [ ] Add CSRF protection verification

**Acceptance Criteria:**
- File type validated correctly
- Size limit enforced
- Invalid URLs rejected
- Path traversal prevented
- CSRF tokens verified
- XSS prevented

### 7.2 Implement EXIF Data Removal
- [ ] Strip EXIF data during image optimization
- [ ] Verify no metadata in saved images
- [ ] Test with various image types
- [ ] Document metadata removal process
- [ ] Add logging for debugging

**Acceptance Criteria:**
- EXIF data removed from all images
- No metadata leakage
- Process tested thoroughly
- Logged appropriately

### 7.3 Add Rate Limiting for Uploads
- [ ] Implement rate limiting on image uploads
- [ ] Set limit to 1 upload per 5 seconds per user
- [ ] Store rate limit data in session
- [ ] Return appropriate error when limit exceeded
- [ ] Log rate limit violations

**Acceptance Criteria:**
- Rate limiting prevents abuse
- Error message clear to user
- Legitimate users not affected
- Violations logged

### 7.4 Implement Admin Session Validation
- [ ] Verify admin session on all image operations
- [ ] Verify session on project create/update
- [ ] Add session timeout
- [ ] Log failed authentication attempts
- [ ] Clear session on logout

**Acceptance Criteria:**
- Only admins can upload images
- Sessions validated consistently
- Timeouts enforced
- Failed attempts logged

## Phase 8: Testing & Quality Assurance

### 8.1 Unit Tests for Image Validation
- [ ] Test file type validation (PNG, JPEG, WebP)
- [ ] Test file size validation (boundary cases)
- [ ] Test filename sanitization
- [ ] Test EXIF removal
- [ ] Test error message generation
- [ ] Achieve >80% code coverage

**Acceptance Criteria:**
- All validation functions tested
- Edge cases covered
- Tests pass and coverage adequate
- No flaky tests

### 8.2 Unit Tests for URL Validation
- [ ] Test valid HTTPS URLs
- [ ] Test invalid URLs
- [ ] Test non-HTTP protocols
- [ ] Test edge cases (very long URLs, special chars)
- [ ] Test internationalized domain names

**Acceptance Criteria:**
- URL validation thorough
- All scenarios tested
- Error messages appropriate
- Tests pass

### 8.3 Integration Tests for Project Creation
- [ ] Test full workflow: upload image → create project
- [ ] Test form submission with image
- [ ] Test database storage
- [ ] Test image file storage
- [ ] Test error scenarios (upload fails, DB fails)
- [ ] Test concurrent uploads

**Acceptance Criteria:**
- Full workflow tested end-to-end
- Error handling verified
- Database consistency verified
- Concurrency handled safely

### 8.4 Integration Tests for Work Page
- [ ] Test featured projects load correctly
- [ ] Test project grid displays all projects
- [ ] Test lazy loading works
- [ ] Test responsive layout on all breakpoints
- [ ] Test pagination if implemented
- [ ] Test filtering if implemented

**Acceptance Criteria:**
- Work page displays correctly
- All projects visible
- Lazy loading functional
- Responsive on all devices

### 8.5 Property-Based Testing (fast-check)
- [ ] Install fast-check package
- [ ] Create property test for image optimization idempotency
- [ ] Create property test for slug uniqueness
- [ ] Create property test for pagination consistency
- [ ] Create property test for URL validation
- [ ] Document property test approach

**Acceptance Criteria:**
- Properties properly defined
- Tests pass with generated examples
- Coverage includes edge cases
- Tests documented

### 8.6 Accessibility Testing
- [ ] Audit with Lighthouse
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify keyboard navigation
- [ ] Check color contrast ratios
- [ ] Verify form labels and error associations
- [ ] Document accessibility testing results

**Acceptance Criteria:**
- WCAG AA compliance verified
- Screen reader tested
- Keyboard navigation works
- Color contrast adequate
- Form accessibility verified

### 8.7 Browser Compatibility Testing
- [ ] Test on Chrome (latest 2 versions)
- [ ] Test on Firefox (latest 2 versions)
- [ ] Test on Safari (latest 2 versions)
- [ ] Test on Edge (latest 2 versions)
- [ ] Test on iOS Safari
- [ ] Test on Chrome Mobile
- [ ] Document compatibility matrix

**Acceptance Criteria:**
- All browsers supported
- No console errors
- Responsive layout works
- Images display correctly
- Interactions functional

### 8.8 Performance Testing
- [ ] Test page load with DevTools
- [ ] Measure Core Web Vitals
- [ ] Test on slow network (3G throttling)
- [ ] Test with many projects (100+)
- [ ] Load test image processing
- [ ] Document performance results

**Acceptance Criteria:**
- Performance targets met
- Performs well on slow networks
- Scales with many projects
- Image processing fast enough

## Phase 9: Documentation & Deployment

### 9.1 Update Project Documentation
- [ ] Document new database fields
- [ ] Document image upload process
- [ ] Document new components
- [ ] Document server actions
- [ ] Add code comments for complex logic
- [ ] Create README for image upload

**Acceptance Criteria:**
- Documentation complete and accurate
- Code comments helpful
- New developers can onboard

### 9.2 Create Admin Guide
- [ ] Document image upload process
- [ ] Document form fields and validation
- [ ] Provide guidelines for project metadata
- [ ] Include tips for choosing images
- [ ] Create troubleshooting section
- [ ] Add screenshots and examples

**Acceptance Criteria:**
- Admin guide complete
- Clear step-by-step instructions
- Troubleshooting covers common issues

### 9.3 Environment Configuration
- [ ] Create .env.example with new variables
- [ ] Document image storage configuration
- [ ] Document optional cloud storage setup
- [ ] Update deployment documentation
- [ ] Test deployment on staging
- [ ] Verify all configurations work

**Acceptance Criteria:**
- Environment variables documented
- Deployment tested
- All configurations verified
- Setup process documented

### 9.4 Deploy to Production
- [ ] Run full test suite
- [ ] Deploy to staging environment
- [ ] Smoke test all features
- [ ] Monitor performance metrics
- [ ] Deploy to production
- [ ] Monitor for errors in production
- [ ] Keep rollback plan ready

**Acceptance Criteria:**
- All tests passing
- Staging deployment successful
- Production deployment successful
- Performance metrics normal
- No error spikes in monitoring
- Rollback plan documented and tested

### 9.5 Create Deployment Checklist
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Image directories created
- [ ] Permissions verified
- [ ] Cache warmed
- [ ] CDN configured
- [ ] Monitoring alerts set
- [ ] Rollback plan ready

**Acceptance Criteria:**
- Checklist complete
- All items verified
- Team trained on deployment
- Rollback tested

## Phase 10: Post-Launch & Monitoring

### 10.1 Monitor Performance
- [ ] Track Core Web Vitals in production
- [ ] Monitor database query performance
- [ ] Track image upload success rates
- [ ] Monitor error rates and types
- [ ] Set up alerting for anomalies
- [ ] Create performance dashboard

**Acceptance Criteria:**
- Monitoring configured
- Dashboards created
- Alerts set up
- Performance baseline established

### 10.2 Gather User Feedback
- [ ] Collect admin feedback on form
- [ ] Collect visitor feedback on portfolio
- [ ] Monitor analytics for engagement
- [ ] Track "Visit Website" button clicks
- [ ] Identify usability issues
- [ ] Document suggestions

**Acceptance Criteria:**
- Feedback collection process established
- Initial feedback gathered
- Issues identified and prioritized
- Improvement roadmap created

### 10.3 Plan Future Enhancements
- [ ] Document feature requests
- [ ] Plan Phase 2 features (image gallery, video support)
- [ ] Plan Phase 3 features (search, analytics)
- [ ] Prioritize based on impact
- [ ] Create roadmap

**Acceptance Criteria:**
- Roadmap documented
- Future phases planned
- Team aligned on priorities
- Backlog prioritized
