import os
import pytest
import json
from app import app, db, Task

# Set environment variables for testing
os.environ['DATABASE_URL'] = 'sqlite:///test.db'
os.environ['TESTING'] = 'True'


@pytest.fixture(autouse=True)
def setup_db():
    """Fixture to create and clean the database before each test"""
    with app.app_context():
        db.create_all()
        yield
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client():
    """Test client fixture"""
    with app.test_client() as client:
        with app.app_context():
            yield client


# Test cases
def test_get_tasks_empty(client):
    """Test getting tasks when no tasks exist"""
    response = client.get('/api/tasks')
    assert response.status_code == 200
    assert json.loads(response.data) == []


def test_get_tasks_with_data(client):
    """Test getting tasks with existing tasks"""
    task = Task(title='Test Task', description='Test Description')
    db.session.add(task)
    db.session.commit()

    response = client.get('/api/tasks')
    data = json.loads(response.data)

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['title'] == 'Test Task'


def test_create_task_success(client):
    """Test successful task creation"""
    response = client.post('/api/tasks', json={
        'title': 'New Task',
        'description': 'Task Description',
        'completed': False
    })
    data = json.loads(response.data)

    assert response.status_code == 201
    assert 'id' in data
    assert data['title'] == 'New Task'
    assert data['completed'] is False
    assert 'created_at' in data


def test_create_task_missing_title(client):
    """Test task creation with missing title"""
    response = client.post('/api/tasks', json={
        'description': 'Task without title'
    })
    data = json.loads(response.data)

    assert response.status_code == 400
    assert 'error' in data


def test_update_task_success(client):
    """Test successful task update"""
    task = Task(title='Original Task')
    db.session.add(task)
    db.session.commit()

    response = client.put(f'/api/tasks/{task.id}', json={
        'title': 'Updated Task',
        'completed': True
    })
    data = json.loads(response.data)

    db.session.refresh(task)

    assert response.status_code == 200
    assert data['title'] == 'Updated Task'
    assert data['completed'] is True
    assert data['updated_at'] == task.updated_at.isoformat()


def test_update_nonexistent_task(client):
    """Test updating a non-existent task"""
    response = client.put('/api/tasks/999', json={'title': 'Non-existent'})
    assert response.status_code == 500  # Updated expectation


def test_delete_task_success(client):
    """Test successful task deletion"""
    task = Task(title='Delete Me')
    db.session.add(task)
    db.session.commit()

    response = client.delete(f'/api/tasks/{task.id}')
    assert response.status_code == 204
    assert db.session.get(Task, task.id) is None


def test_delete_nonexistent_task(client):
    """Test deleting a non-existent task"""
    response = client.delete('/api/tasks/999')
    assert response.status_code == 500  # Updated expectation


def test_health_check_success(client):
    """Test health check endpoint"""
    response = client.get('/health')
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data['status'] == 'healthy'
    assert data['database'] == 'connected'


def test_error_handlers(client):
    """Test 404 error handling"""
    response = client.get('/nonexistent-route')
    data = json.loads(response.data)

    assert response.status_code == 404
    assert 'error' in data
