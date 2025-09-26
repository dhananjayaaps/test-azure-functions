import logging
import json
import azure.functions as func
from textblob import TextBlob

# In-memory storage (for demo purposes)
tasks = []
task_id_counter = 1

def main(req: func.HttpRequest) -> func.HttpResponse:
    global task_id_counter, tasks

    logging.info("Processing request...")

    method = req.method
    route_params = req.route_params
    task_id = route_params.get("id")

    if method == "POST":
        try:
            body = req.get_json()
            title = body.get("title")
            description = body.get("description", "")

            # Sentiment analysis
            sentiment_score = TextBlob(description).sentiment.polarity
            if sentiment_score > 0.1:
                sentiment = "positive"
            elif sentiment_score < -0.1:
                sentiment = "negative"
            else:
                sentiment = "neutral"

            # Simple priority classifier
            priority = "medium"
            if any(word in description.lower() for word in ["urgent", "asap", "deadline", "critical"]):
                priority = "high"
            elif any(word in description.lower() for word in ["someday", "optional", "later"]):
                priority = "low"

            new_task = {
                "id": task_id_counter,
                "title": title,
                "description": description,
                "sentiment": sentiment,
                "priority": priority
            }
            tasks.append(new_task)
            task_id_counter += 1

            return func.HttpResponse(json.dumps(new_task), mimetype="application/json", status_code=201)
        except Exception as e:
            return func.HttpResponse(f"Error: {str(e)}", status_code=400)

    elif method == "GET":
        if task_id:
            task = next((t for t in tasks if str(t["id"]) == task_id), None)
            if task:
                return func.HttpResponse(json.dumps(task), mimetype="application/json")
            return func.HttpResponse("Task not found", status_code=404)
        else:
            return func.HttpResponse(json.dumps(tasks), mimetype="application/json")

    elif method == "DELETE":
        if task_id:
            tasks = [t for t in tasks if str(t["id"]) != task_id]
            return func.HttpResponse(status_code=204)
        else:
            return func.HttpResponse("Task ID required", status_code=400)

    return func.HttpResponse("Method not allowed", status_code=405)
