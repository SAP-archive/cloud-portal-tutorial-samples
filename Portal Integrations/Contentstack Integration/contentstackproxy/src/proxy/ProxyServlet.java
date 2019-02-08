package proxy;

import static java.net.HttpURLConnection.HTTP_OK;

import java.io.IOException;
import java.io.InputStream;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sap.core.connectivity.api.DestinationException;
import com.sap.core.connectivity.api.DestinationFactory;
import com.sap.core.connectivity.api.DestinationNotFoundException;
import com.sap.core.connectivity.api.configuration.ConnectivityConfiguration;
import com.sap.core.connectivity.api.configuration.DestinationConfiguration;
import com.sap.core.connectivity.api.http.HttpDestination;

/**
 * Servlet implementation class ProxyServlet
 */
public class ProxyServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;	
	private static final int COPY_CONTENT_BUFFER_SIZE = 1024;
	private static final Logger LOGGER = LoggerFactory.getLogger(ProxyServlet.class);

	private static final String API_KEY = "API_KEY";
	private static final String AUTHTOKEN = "AUTHTOKEN";
	private static final String ENVIRONMENT = "environment";
	
	/**
	 * Name of the destination for the Contentstack backend. 
	 */
    private static final String CONTENTSTACK_BACKEND = "contentstack_backend";
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ProxyServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	    HttpClient httpClient = null;
	    HttpDestination httpDestination = null;
	 
	    try {
            httpDestination = getDestination(CONTENTSTACK_BACKEND);
            httpClient = httpDestination.createHttpClient();
            
            String apiKey = getPropertyValueFromDestination(CONTENTSTACK_BACKEND, API_KEY);
            String authKey = getPropertyValueFromDestination(CONTENTSTACK_BACKEND, AUTHTOKEN);
            String environment = getPropertyValueFromDestination(CONTENTSTACK_BACKEND, ENVIRONMENT);
            
            String queryString = request.getQueryString();
            
            //TODO change according to the environments 
            if (queryString == null) {
            	queryString = API_KEY + '=' + apiKey + '&' + AUTHTOKEN + '=' +authKey + '&' + ENVIRONMENT + '=' + environment;
            } else {
            	queryString = queryString + '&' + API_KEY + '=' + apiKey + '&' + AUTHTOKEN + '=' +authKey + '&' + ENVIRONMENT + '=' + environment;
            }
            
            String requestURI = request.getRequestURI();
            String url = requestURI.replaceFirst(request.getContextPath() + '/', "");
            
            HttpRequestBase httpGet = new HttpGet(url + '?' + queryString);
            HttpResponse httpResponse = executeRequest(httpGet, httpClient);
            
            int statusCode = httpResponse.getStatusLine().getStatusCode();
            if (statusCode != HTTP_OK) {
                throw new ServletException("Expected response status code is 200 but it is " + statusCode + " .");
            }
            
            // Copy content from the incoming response to the outgoing response
            HttpEntity entity = httpResponse.getEntity();
            if (entity != null) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("application/json");
                InputStream instream = entity.getContent();
                try {
                    byte[] buffer = new byte[COPY_CONTENT_BUFFER_SIZE];
                    int len;
                    while ((len = instream.read(buffer)) != -1) {
                        response.getOutputStream().write(buffer, 0, len);
                    }
                } catch (IOException e) {
                    // In case of an IOException the connection will be released
                    // back to the connection manager automatically
                    throw e;
                } catch (RuntimeException e) {
                    // In case of an unexpected exception you may want to abort
                    // the HTTP request in order to shut down the underlying
                    // connection immediately.
                    httpGet.abort();
                    throw e;
                } finally {
                    // Closing the input stream will trigger connection release
                    try {
                        instream.close();
                    } catch (Exception e) {
                    // Ignore
                    }
                }
            }
        } catch (DestinationException | NamingException e) {
            LOGGER.debug("error" + e);
        }
        
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
	
	private HttpDestination getDestination(String destinationName) throws DestinationNotFoundException, NamingException {
        HttpDestination destination;
        try {
            Context ctx = new InitialContext();
            DestinationFactory destinationFactory = (DestinationFactory) ctx.lookup(DestinationFactory.JNDI_NAME);
            destination = destinationFactory.getDestination(destinationName);
        } catch (DestinationNotFoundException e) {
            String msg = String.format("Cannot find destination '%s'", destinationName);
            LOGGER.debug(msg);
            throw e;
        } catch (NamingException e) {
            String msg = "Cannot get destination factory";
            LOGGER.debug(msg);
            throw e;
        }
        return destination;
    }
	
	private HttpResponse executeRequest(HttpRequestBase httpRequest, HttpClient httpClient) throws IOException {
        HttpResponse response;
        try {
            response = httpClient.execute(httpRequest);
        } catch (ClientProtocolException e) {
            String msg = String.format("Error executing request to %s due to a protocol error",
                    httpRequest.getURI().toString());
            LOGGER.debug(msg);
            throw e;
        } catch (IOException e) {
            String msg = String.format("Error executing request to %s. A problem accrued or the connection was aborted",
                    httpRequest.getURI().toString());
            LOGGER.debug(msg);
            throw e;
            
        }
        return response;
    }
	
	private static String getPropertyValueFromDestination(String destinationName, String propertyName) throws DestinationException {
        try {
            ConnectivityConfiguration connectivityConfiguration = getConnectivityConfiguration();
            DestinationConfiguration destinationConfiguration = connectivityConfiguration.getConfiguration(destinationName);
            return destinationConfiguration.getProperty(propertyName);
        } catch (NamingException e) {
            throw new DestinationException(String.format("Error when tried to get property(%s) from destination(%s)", propertyName, destinationName), e);
        }
    }
	
	private static ConnectivityConfiguration getConnectivityConfiguration() throws NamingException {
        Context ctx;
        ConnectivityConfiguration configuration;
        ctx = new InitialContext();
        configuration = (ConnectivityConfiguration) ctx.lookup("java:comp/env/connectivityConfiguration");

        return configuration;
    }
	

}
