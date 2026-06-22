package main

import (
	"bytes"
	"context"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type AnalyzeRequest struct {
	RepoUrl string `json:"repoUrl" binding:"required"`
}

func main() {
	r := gin.Default()

	r.Use((cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})))

	r.POST("/api/analyze", handleAnalyze)

	r.Run(":5001")
}

func handleAnalyze(c *gin.Context) {
	var req AnalyzeRequest

	_, filename, _, _ := runtime.Caller(0)
	currentDir := filepath.Dir(filename)

	pythonExec := filepath.Join(currentDir, "..", "..", "analyzer-engine", "venv", "bin", "python")

	pythonScript := filepath.Join(currentDir, "..", "..", "analyzer-engine", "src", "engine.py")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Request Parameters: repoUrl is required"})
		return
	}

	// incase Python engine takes too long, we don't want to keep the HTTP connection hanging indefinitely
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	log.Printf("🚀 Go 正在调用绝对路径 Python: %s", pythonExec)
	log.Printf("📂 目标脚本: %s", pythonScript)

	cmd := exec.CommandContext(ctx, pythonExec, pythonScript)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	// get the output of the Python script, which is expected to be a JSON string containing the analysis results
	output, err := cmd.Output()
	if err != nil {
		log.Printf("Error executing Python script: %v, stderr: %s", err, stderr.String())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Python Analysis Engine Execution Failed",
			"details": err.Error(),
		})
		return
	}

	// because Go's os/exec.Command.Output() will directly return this output as a byte stream,
	// the Go backend will directly return this raw JSON data byte stream to the Angular frontend, efficient and zero conversion overhead!
	c.Data(http.StatusOK, "application/json", output)
}