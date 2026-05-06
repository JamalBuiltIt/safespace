function ProfileCard({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="profileCard">
      <img
        src={`/avatars/${user.avatar}`}
        alt={`${user.displayName} avatar`}
        width={120}
      />

      <h2>{user.displayName}</h2>
      <p>Age: {user.age}</p>
      <p>Gender: {user.gender}</p>

      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default ProfileCard;