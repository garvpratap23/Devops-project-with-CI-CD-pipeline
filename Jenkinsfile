pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        SONAR_TOKEN = credentials('sonar-token')

        DOCKER_IMAGE_BACKEND = "${env.DOCKER_HUB_USER ?: 'your-dockerhub-user'}/taskmanager-api"
        DOCKER_IMAGE_FRONTEND = "${env.DOCKER_HUB_USER ?: 'your-dockerhub-user'}/taskmanager-ui"

        IMAGE_TAG = "${env.GIT_COMMIT?.take(8) ?: 'latest'}"
    }

    options {
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('1. Checkout') {
            steps {
                checkout scm
                echo "Checked out commit: ${env.GIT_COMMIT}"
            }
        }

        stage('2. Install Dependencies') {
            parallel {

                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            script {
                                runCommand('npm ci')
                            }
                        }
                    }
                }

                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            script {
                                runCommand('npm ci')
                            }
                        }
                    }
                }
            }
        }

        stage('3. ESLint') {
            parallel {

                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            script {
                                runCommand('npm run lint')
                            }
                        }
                    }
                }

                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            script {
                                runCommand('npx eslint src/ --ext .ts,.tsx')
                            }
                        }
                    }
                }
            }
        }

        stage('4. SonarQube Scan') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {

                        if (isUnix()) {
                            sh """
                                npx sonar-scanner \
                                    -Dsonar.projectKey=task-manager \
                                    -Dsonar.sources=backend/src,frontend/src \
                                    -Dsonar.host.url=${SONAR_HOST_URL} \
                                    -Dsonar.token=${SONAR_TOKEN}
                            """
                        } else {
                            bat """
                                npx sonar-scanner ^
                                    -Dsonar.projectKey=task-manager ^
                                    -Dsonar.sources=backend/src,frontend/src ^
                                    -Dsonar.host.url=%SONAR_HOST_URL% ^
                                    -Dsonar.token=%SONAR_TOKEN%
                            """
                        }
                    }
                }
            }
        }

        stage('5. Unit Tests') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                runCommand('npm run test:unit')
                            }
                        }
                    }

                    post {
                        always {
                            junit allowEmptyResults: true,
                                   testResults: 'backend/coverage/junit.xml'

                            publishHTML(target: [
                                reportDir   : 'backend/coverage/lcov-report',
                                reportFiles : 'index.html',
                                reportName  : 'Backend Coverage'
                            ])
                        }
                    }
                }
            }
        }

        stage('6. Build Docker Images') {
            parallel {

                stage('Build Backend') {
                    steps {
                        script {
                            runCommand(
                                "docker build -f docker/backend.Dockerfile -t ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG} backend/"
                            )
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        script {
                            runCommand(
                                "docker build -f docker/frontend.Dockerfile -t ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} frontend/"
                            )
                        }
                    }
                }
            }
        }

        stage('7. Trivy Security Scan') {
            parallel {

                stage('Scan Backend Image') {
                    steps {
                        script {
                            runCommand(
                                "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}"
                            )
                        }
                    }
                }

                stage('Scan Frontend Image') {
                    steps {
                        script {
                            runCommand(
                                "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG}"
                            )
                        }
                    }
                }
            }
        }

        stage('8. Push Images') {
            when {
                branch 'main'
            }

            steps {
                script {

                    if (isUnix()) {

                        sh """
                            echo ${DOCKER_HUB_CREDS_PSW} | docker login \
                            -u ${DOCKER_HUB_CREDS_USR} \
                            --password-stdin
                        """

                    } else {

                        bat """
                            echo %DOCKER_HUB_CREDS_PSW% | docker login ^
                            -u %DOCKER_HUB_CREDS_USR% ^
                            --password-stdin
                        """
                    }

                    runCommand("docker push ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}")
                    runCommand("docker push ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG}")

                    runCommand(
                        "docker tag ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG} ${DOCKER_IMAGE_BACKEND}:latest"
                    )

                    runCommand(
                        "docker tag ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} ${DOCKER_IMAGE_FRONTEND}:latest"
                    )

                    runCommand("docker push ${DOCKER_IMAGE_BACKEND}:latest")
                    runCommand("docker push ${DOCKER_IMAGE_FRONTEND}:latest")
                }
            }
        }

        stage('9. Deploy Staging') {

            when {
                branch 'main'
            }

            steps {
                script {

                    if (isUnix()) {

                        sh """
                            kubectl set image deployment/taskmanager-api \
                                taskmanager-api=${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG} \
                                -n task-manager-staging

                            kubectl set image deployment/taskmanager-ui \
                                taskmanager-ui=${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} \
                                -n task-manager-staging

                            kubectl rollout status deployment/taskmanager-api \
                                -n task-manager-staging \
                                --timeout=120s

                            kubectl rollout status deployment/taskmanager-ui \
                                -n task-manager-staging \
                                --timeout=120s
                        """

                    } else {

                        bat """
                            kubectl set image deployment/taskmanager-api ^
                                taskmanager-api=${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG} ^
                                -n task-manager-staging

                            kubectl set image deployment/taskmanager-ui ^
                                taskmanager-ui=${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} ^
                                -n task-manager-staging

                            kubectl rollout status deployment/taskmanager-api ^
                                -n task-manager-staging ^
                                --timeout=120s

                            kubectl rollout status deployment/taskmanager-ui ^
                                -n task-manager-staging ^
                                --timeout=120s
                        """
                    }
                }
            }
        }

        stage('10. Integration Tests') {

            when {
                branch 'main'
            }

            steps {
                dir('backend') {
                    script {
                        runCommand('npm run test:integration')
                    }
                }
            }
        }

        stage('11. OWASP ZAP Scan') {

            when {
                branch 'main'
            }

            steps {

                script {

                    if (isUnix()) {

                        sh """
                            docker run --rm -v \$(pwd):/zap/wrk/:rw \
                                ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py \
                                -t http://staging-api:3001/api/health \
                                -f openapi \
                                -r zap-report.html || true
                        """

                    } else {

                        bat """
                            docker run --rm -v %cd%:/zap/wrk/:rw ^
                                ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py ^
                                -t http://staging-api:3001/api/health ^
                                -f openapi ^
                                -r zap-report.html
                        """
                    }
                }
            }

            post {
                always {

                    publishHTML(target: [
                        reportDir   : '.',
                        reportFiles : 'zap-report.html',
                        reportName  : 'OWASP ZAP Report'
                    ])
                }
            }
        }

        stage('12. k6 Load Test') {

            when {
                branch 'main'
            }

            steps {
                script {
                    runCommand('k6 run backend/src/tests/load/k6-test.js')
                }
            }
        }
    }

    post {

        failure {

            script {

                if (env.BRANCH_NAME == 'main') {

                    if (isUnix()) {

                        sh """
                            kubectl rollout undo deployment/taskmanager-api \
                                -n task-manager-staging || true

                            kubectl rollout undo deployment/taskmanager-ui \
                                -n task-manager-staging || true
                        """

                    } else {

                        bat """
                            kubectl rollout undo deployment/taskmanager-api ^
                                -n task-manager-staging

                            kubectl rollout undo deployment/taskmanager-ui ^
                                -n task-manager-staging
                        """
                    }
                }
            }

            echo 'Pipeline FAILED.'
        }

        success {
            echo 'Pipeline SUCCEEDED.'
        }

        always {
            cleanWs()
        }
    }
}

/*
|--------------------------------------------------------------------------
| Cross Platform Helper Function
|--------------------------------------------------------------------------
*/

def runCommand(String command) {

    if (isUnix()) {
        sh command
    } else {
        bat command
    }
}