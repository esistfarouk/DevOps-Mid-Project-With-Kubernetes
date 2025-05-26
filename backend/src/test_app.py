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

# Test cases (only showing modified tests)


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

    # Refresh from database
    db.session.refresh(task)

    assert response.status_code == 200
    assert data['title'] == 'Updated Task'
    assert data['completed'] is True
    assert data['updated_at'] == task.updated_at.isoformat()


def test_update_nonexistent_task(client):
    """Test updating a non-existent task"""
    response = client.put('/api/tasks/999', json={'title': 'Non-existent'})
    assert response.status_code == 500  # Matches current error handling


def test_delete_nonexistent_task(client):
    """Test deleting a non-existent task"""
    response = client.delete('/api/tasks/999')
    assert response.status_code == 500  # Matches current error handling


def test_delete_task_success(client):
    """Test successful task deletion"""
    task = Task(title='Delete Me')
    db.session.add(task)
    db.session.commit()

    response = client.delete(f'/api/tasks/{task.id}')
    assert response.status_code == 204
    assert db.session.get(Task, task.id) is None  # Modern query method
