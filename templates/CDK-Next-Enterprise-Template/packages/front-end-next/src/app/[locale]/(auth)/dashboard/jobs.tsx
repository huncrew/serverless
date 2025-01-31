interface Job {
    jobId: string;
    createdAt: string;
    result: any[]; // Replace `any` with a specific type if possible
    resultsCount: number;
    // Remove 'status' as it's not present in the data
  }
  
  
  const JobsTab: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    const { user } = useUser();
    const router = useRouter();
  
    console.log(loading)
    console.log(error)
  
    useEffect(() => {
      const fetchJobs = async () => {
        if (!user) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }
  
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_AWS_API_URL}/jobs`, {
            headers: {
              'X-User-Id': user.id,
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch jobs');
          }
  
          const data = await response.json();
  
          console.log('CONSOLING THE DATA', data)
  
          // Map the data to the Job interface
          const mappedJobs: Job[] = data.map((job: any) => ({
            jobId: job.jobId, // Directly use 'jobId' from data
            createdAt: job.createdAt, // Use the correct case
            result: job.result, // Directly use 'result' array
            resultsCount: job.result ? job.result.length : 0, // Correctly reference 'result'
          }));
          
  
          setJobs(mappedJobs);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchJobs();
    }, [user]);
  
    const handleViewDetails = (jobId: string) => {
      router.push(`/dashboard/jobs/${jobId}`);
    };
  
    // ... (rest of the component remains the same)
  
    return (
      <div className="bg-card p-5 rounded-md">
        <h2 className="text-xl font-semibold text-primary">Your Jobs</h2>
        <table className="min-w-full mt-4">
    <thead>
      <tr>
        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Job ID</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Created At</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Feedback Count</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Actions</th>
        {/* Remove or add additional headers if necessary */}
      </tr>
    </thead>
    <tbody>
      {jobs.map((job) => (
        <tr key={job.jobId} className="border-t border-border">
          <td className="px-4 py-2 text-sm text-foreground">{job.jobId}</td>
          <td className="px-4 py-2 text-sm text-foreground">
            {new Date(job.createdAt).toLocaleString()}
          </td>
          <td className="px-4 py-2 text-sm text-foreground">{job.resultsCount}</td>
          <td className="px-4 py-2 text-sm text-foreground">
            <button
              onClick={() => handleViewDetails(job.jobId)}
              className="text-primary hover:underline"
            >
              View Details
            </button>
          </td>
          {/* Remove 'status' and 'result' cells */}
        </tr>
      ))}
    </tbody>
  </table>
  
      </div>
    );
  };