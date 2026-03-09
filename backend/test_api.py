"""Internal backend API test suite."""
import urllib.request
import json
import sys


BASE = "http://localhost:8000"
PASS = 0
FAIL = 0


def post(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(data).encode(),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def get(path, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, headers=headers)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def ok(label):
    global PASS
    PASS += 1
    print(f"  [PASS] {label}")


def fail(label, err):
    global FAIL
    FAIL += 1
    print(f"  [FAIL] {label}: {err}")


# ── Test 1: Health ────────────────────────────────────────────────────────────
print("=== Test 1: Health check ===")
try:
    r = get("/api/health")
    assert r["status"] == "ok"
    ok("Health check returns {status: ok}")
except Exception as e:
    fail("Health check", e)

# ── Test 2: Login ─────────────────────────────────────────────────────────────
print("=== Test 2: Login ===")
token = None
user_id = None
try:
    r = post("/api/auth/login", {"email": "student@evai.lo", "password": "password123"})
    token = r["access_token"]
    user_id = r["user"]["id"]
    assert r["user"]["name"] == "Dang Linh Phan"
    assert r["user"]["role"] == "student"
    ok(f"Login as student: {r['user']['name']}")
except Exception as e:
    fail("Login", e)
    sys.exit(1)

# ── Test 3: Wrong password ────────────────────────────────────────────────────
print("=== Test 3: Wrong password rejected ===")
try:
    try:
        post("/api/auth/login", {"email": "student@evai.lo", "password": "wrong"})
        fail("Wrong password", "Should have raised 401")
    except urllib.error.HTTPError as e:
        assert e.code == 401
        ok("Wrong password returns 401")
except Exception as e:
    fail("Wrong password", e)

# ── Test 4: GET /me ───────────────────────────────────────────────────────────
print("=== Test 4: GET /auth/me ===")
try:
    me = get("/api/auth/me", token)
    assert me["email"] == "student@evai.lo"
    ok(f"GET /me: {me['name']} / {me['email']}")
except Exception as e:
    fail("GET /me", e)

# ── Test 5: Courses ───────────────────────────────────────────────────────────
print("=== Test 5: GET /courses ===")
try:
    courses = get("/api/courses", token)
    assert len(courses) == 3
    ids = [c["id"] for c in courses]
    assert "ifb220" in ids and "iab230" in ids and "capstone" in ids
    ok(f"{len(courses)} courses: {ids}")
except Exception as e:
    fail("GET /courses", e)

# ── Test 6: Assignments (all) ─────────────────────────────────────────────────
print("=== Test 6: GET /assignments ===")
try:
    assignments = get("/api/assignments", token)
    assert len(assignments) == 8
    statuses = {a["status"] for a in assignments}
    ok(f"{len(assignments)} assignments, statuses: {statuses}")
except Exception as e:
    fail("GET /assignments", e)

# ── Test 7: Assignments filtered by course ────────────────────────────────────
print("=== Test 7: GET /assignments?course_id=ifb220 ===")
try:
    assignments = get("/api/assignments?course_id=ifb220", token)
    assert len(assignments) == 6
    ok(f"{len(assignments)} ifb220 assignments")
except Exception as e:
    fail("GET /assignments?course_id=ifb220", e)

# ── Test 8: Analytics ─────────────────────────────────────────────────────────
print("=== Test 8: GET /analytics?course_id=ifb220 ===")
try:
    analytics = get("/api/analytics?course_id=ifb220", token)
    assert len(analytics["bar_data"]) > 0
    assert len(analytics["line_data"]) > 0
    assert len(analytics["assignments"]) > 0
    bar = analytics["bar_data"][0]
    assert "name" in bar and "you" in bar and "avg" in bar
    ok(f"Analytics: {len(analytics['bar_data'])} bar items, avg[0]={bar['avg']}")
except Exception as e:
    fail("GET /analytics", e)

# ── Test 9: Discussions ───────────────────────────────────────────────────────
print("=== Test 9: GET /discussions ===")
try:
    threads = get("/api/discussions", token)
    assert len(threads) == 4
    t = threads[0]
    assert "id" in t and "title" in t and "replies" in t
    ok(f"{len(threads)} threads, first: '{t['title'][:40]}'")
except Exception as e:
    fail("GET /discussions", e)

# ── Test 10: Thread replies ───────────────────────────────────────────────────
print("=== Test 10: GET /discussions/t1/replies ===")
try:
    replies = get("/api/discussions/t1/replies", token)
    assert len(replies) >= 2
    ok(f"{len(replies)} replies for thread t1")
except Exception as e:
    fail("GET /discussions/t1/replies", e)

# ── Test 11: Post reply ───────────────────────────────────────────────────────
print("=== Test 11: POST /discussions/t1/replies ===")
try:
    r = post("/api/discussions/t1/replies", {"body": "Automated test reply"}, token)
    assert r["author"] == "Dang Linh Phan"
    assert r["body"] == "Automated test reply"
    ok(f"Reply posted by {r['author']}: is_op={r['is_op']}")
except Exception as e:
    fail("POST /discussions/t1/replies", e)

# ── Test 12: Modules ──────────────────────────────────────────────────────────
print("=== Test 12: GET /modules?courseId=ifb220 ===")
try:
    modules = get("/api/modules?courseId=ifb220", token)
    assert len(modules) >= 2
    ok(f"{len(modules)} modules for ifb220")
except Exception as e:
    fail("GET /modules", e)

# ── Test 13: Submit assignment ────────────────────────────────────────────────
print("=== Test 13: POST /assignments/{id}/submit ===")
try:
    all_assignments = get("/api/assignments", token)
    missing = next((a for a in all_assignments if a["status"] == "missing"), None)
    if missing:
        r = post(f"/api/assignments/{missing['id']}/submit", {}, token)
        assert r["status"] == "submitted"
        ok(f"Submitted assignment: {missing['name']}")
    else:
        ok("No missing assignments to submit (already submitted)")
except Exception as e:
    fail("POST /assignments/submit", e)

# ── Test 14: Auth required ────────────────────────────────────────────────────
print("=== Test 14: Unauthenticated request rejected ===")
try:
    try:
        get("/api/assignments")
        fail("No auth", "Should have raised 401")
    except urllib.error.HTTPError as e:
        assert e.code == 401
        ok("Unauthenticated /assignments returns 401")
except Exception as e:
    fail("Auth required check", e)

# ── Test 15: Register new user ────────────────────────────────────────────────
print("=== Test 15: POST /auth/register ===")
try:
    import random
    test_email = f"testuser{random.randint(1000, 9999)}@evai.lo"
    r = post("/api/auth/register", {"name": "Test User", "email": test_email, "password": "test1234"})
    assert "access_token" in r
    assert r["user"]["email"] == test_email
    ok(f"Registered new user: {test_email}")
except Exception as e:
    fail("POST /auth/register", e)

# ── Summary ───────────────────────────────────────────────────────────────────
print()
print(f"Results: {PASS} passed, {FAIL} failed out of {PASS + FAIL} tests")
if FAIL > 0:
    sys.exit(1)
else:
    print("ALL TESTS PASSED")
